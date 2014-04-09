
def changeAllKeys(obj, oldKey, newKey):
    if not isinstance(obj, dict):
        return

    for key in obj:
        if key == oldKey:
            obj[newKey] = obj.pop(oldKey)
            key = newKey

        if isinstance(obj[key], dict):
            changeAllKeys(obj[key], oldKey, newKey)

        elif isinstance(obj[key], list):
            for element in obj[key]:
                changeAllKeys(element, oldKey, newKey)