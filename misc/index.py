import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

def prettify_xml(elem):
  """Return a pretty-printed XML string for the Element."""
  rough_string = ET.tostring(elem, 'utf-8')
  reparsed = minidom.parseString(rough_string)
  return reparsed.toprettyxml(indent="  ")

def load_json_with_includes(filepath, base_path=""):
  """Load a JSON file and handle 'include' directives."""
  full_path = os.path.join(base_path, filepath)
  with open(full_path, "r") as f:
    data = json.load(f)

  if "include" in data:
    include_path = data.pop("include")
    base_json = load_json_with_includes(include_path, os.path.dirname(full_path))
    # Merge base JSON into current JSON
    base_json.update(data)
    return base_json

  return data

def convert_json_to_tmtheme(json_data):
  root = ET.Element("plist", version="1.0")
  dict_elem = ET.SubElement(root, "dict")

  def add_key_value(parent, key, value):
    key_elem = ET.SubElement(parent, "key")
    key_elem.text = key
    if isinstance(value, dict):
      dict_elem = ET.SubElement(parent, "dict")
      for k, v in value.items():
        add_key_value(dict_elem, k, v)
    elif isinstance(value, list):
      array_elem = ET.SubElement(parent, "array")
      for item in value:
        add_key_value(array_elem, None, item)
    else:
      string_elem = ET.SubElement(parent, "string")
      string_elem.text = value

  # Basic theme metadata
  add_key_value(dict_elem, "name", json_data.get("name", ""))
  add_key_value(dict_elem, "uuid", "00000000-0000-0000-0000-000000000000")  # Example UUID

  # Settings for colors
  settings_array = ET.SubElement(dict_elem, "array")

  # Global settings
  global_settings = ET.SubElement(settings_array, "dict")
  add_key_value(global_settings, "settings", {})
  for key, value in json_data.get("colors", {}).items():
    add_key_value(global_settings, key, value)

  # Token colors
  for token in json_data.get("tokenColors", []):
    token_settings = ET.SubElement(settings_array, "dict")
    if "name" in token:
      add_key_value(token_settings, "name", token["name"])
    add_key_value(token_settings, "scope", token["scope"])
    add_key_value(token_settings, "settings", token["settings"])

  return prettify_xml(root)

# Load your JSON theme, handling 'include' directives
base_path = "."  # Replace with the directory containing your theme files
theme_data = load_json_with_includes("dark_modern.json", base_path)

# Convert to tmTheme XML
tmtheme_content = convert_json_to_tmtheme(theme_data)

# Save the tmTheme file
with open("your_theme.tmTheme", "w") as f:
  f.write(tmtheme_content)

print("Conversion completed. Saved as 'your_theme.tmTheme'.")
