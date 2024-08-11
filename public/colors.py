import json

def remove_duplicates_and_sort_references(colors):
    for color in colors.values():
        if 'references' in color:
            # Remove duplicates by converting the list to a set
            unique_references = set(color['references'])
            # Convert the references to integers, sort them, then convert back to strings
            sorted_references = sorted(unique_references, key=int)
            # Update the references list with sorted values
            color['references'] = list(map(str, sorted_references))

# Load the JSON data from the file
with open('colors.json', 'r') as file:
    data = json.load(file)

# Remove duplicates and sort references
remove_duplicates_and_sort_references(data['colors'])

# Write the modified JSON data back to the file
with open('colors.json', 'w') as file:
    json.dump(data, file, indent=2)

print("Removed duplicates and sorted 'references' numerically for every color.")