def isbn13_to_isbn10(isbn13):
    if not isbn13.startswith("978") or len(isbn13) != 13:
        return None
    core = isbn13[3:-1]
    total = sum((10 - i) * int(d) for i, d in enumerate(core))
    checksum = (11 - (total % 11)) % 11
    checksum_char = "X" if checksum == 10 else str(checksum)
    return core + checksum_char

# Przykład użycia
isbn13 = '9788368123074'
isbn10 = isbn13_to_isbn10(isbn13)
print(f"ISBN-10: {isbn10}")
