import os
os.system('cls')

import base64

test = base64.b64decode(b'MzEzMTMwMmQ2NDYxNzk3MzJkNjE2Njc0NjU3MjJkNmM2NTY4NmQ2MTZlMmQ2MzZmNmM2YzYxNzA3MzY1NjQyZTZhNzA2Nwo=')
print(test)
# test = base64.b64decode(test)
# print(test)
# test = base64.b32decode(test)
# print(test)

# F\xb0\xa5$[\x0f\x9c\xd3P\xfa\xc5f\xb8p\xe4\xf4F\xb1-G\x8c\x86\xc4Uv>Jt\n(\xb2\xf3IT%\xfe[z\x1c>P\xfa\xae~\x93\x0f\xd81F\xb2\xf1\x81\x96'M\x87k\xf5\x1d\x8b\n*{QI8\x8di[\x87\xc7\xe7\x1f2\x89W
# \x14\xf7\xe9\x14e/&\xd2\x13\xcc\xfdE2D\x08\xf2-\x96
# str = "MzEzMTMwMmQ2NDYxNzk3MzJkNjE2Njc0NjU3MjJkNmM2NTY4NmQ2MTZlMmQ2MzZmNmM2YzYxNzA3MzY1NjQyZTZhNzA2Nwo=";

# s = str.encode().decode()

# https://api.alpaca.markets/v2/puzzle/202108/hint/3131302d646179732d61667465722d6c65686d616e2d636f6c6c61707365642e6a7067\n

# print(str)
# print(s)

# print ("Decoded String: " + Str.decode('base64','strict'))