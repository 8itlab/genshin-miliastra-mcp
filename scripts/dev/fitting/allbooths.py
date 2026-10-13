# allbooths.py <video> <log ahead>: bs_<n>.jpg for every booth (boothsheet.py), three frames a second.
import os, subprocess, sys
for b in range(33):
    subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'boothsheet.py'), sys.argv[1], sys.argv[2], '3', '5', '400', '0.12', '0.18', '0.88', '0.80', str(b)])
