"""scrub_account.py <account id> <save>...: takes the account id of the creator out of saves that are kept as test fixtures.

The editor writes the id of the account into every save it writes (a number, as a protobuf varint). A fixture that goes
into a public repository should not carry it: this replaces every occurrence with 100000000, which has the same length,
so nothing else in the file moves. Prints how many it replaced in each file; run the tests afterwards."""
import sys
def varint(n):
    out = bytearray()
    while n > 127:
        out.append(n & 127 | 128); n >>= 7
    out.append(n)
    return bytes(out)
old, new = varint(int(sys.argv[1])), varint(100000000)
assert len(old) == len(new), 'the stand-in must be as long as the id'
for path in sys.argv[2:]:
    data = open(path, 'rb').read()
    n = data.count(old)
    if n:
        open(path, 'wb').write(data.replace(old, new))
    print(n, path)
