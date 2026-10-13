"""Kernel mutex guard, no desktop access. JSON lines over private inherited pipes."""
import ctypes, ctypes.wintypes as w, hashlib, json, os, sys
k=ctypes.WinDLL('kernel32',use_last_error=True)
k.CreateMutexW.argtypes=[w.LPVOID,w.BOOL,w.LPCWSTR];k.CreateMutexW.restype=w.HANDLE
k.WaitForSingleObject.argtypes=[w.HANDLE,w.DWORD];k.WaitForSingleObject.restype=w.DWORD
k.OpenProcess.argtypes=[w.DWORD,w.BOOL,w.DWORD];k.OpenProcess.restype=w.HANDLE
k.GetProcessTimes.argtypes=[w.HANDLE,ctypes.POINTER(w.FILETIME),ctypes.POINTER(w.FILETIME),ctypes.POINTER(w.FILETIME),ctypes.POINTER(w.FILETIME)];k.GetProcessTimes.restype=w.BOOL
k.CloseHandle.argtypes=[w.HANDLE];k.ReleaseMutex.argtypes=[w.HANDLE]
def birth(pid):
    h=k.OpenProcess(0x1000|0x100000,False,pid)
    if not h:
        if ctypes.get_last_error()==87:return None
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        # Windows can retain a terminated process object while handles exist.
        # A signalled process is dead even when its creation time is readable.
        state=k.WaitForSingleObject(h,0)
        if state==0:return None
        if state!=258:raise ctypes.WinError(ctypes.get_last_error())
        times=[w.FILETIME() for _ in range(4)]
        if not k.GetProcessTimes(h,*[ctypes.byref(t) for t in times]):raise ctypes.WinError(ctypes.get_last_error())
        return str((times[0].dwHighDateTime<<32)|times[0].dwLowDateTime)
    finally:k.CloseHandle(h)
def emit(data):print(json.dumps(data),flush=True)
try:
    workspace=os.path.realpath(sys.argv[1]).lower()
    mutex=k.CreateMutexW(None,False,'Global\\MiliastraCore-'+hashlib.sha256(workspace.encode('utf-8')).hexdigest())
    if not mutex:raise ctypes.WinError(ctypes.get_last_error())
    result=k.WaitForSingleObject(mutex,0)
    if result not in (0,128):
        emit({'error':'WORKSPACE_IN_USE'});sys.exit(2)
    try:
        emit({'ready':True,'processIdentity':birth(int(sys.argv[2])),'abandoned':result==128})
        for line in sys.stdin:
            message=json.loads(line)
            if message.get('op')=='close':break
            if message.get('op')!='inspect' or type(message.get('pid')) is not int or not 0<message['pid']<2**32:raise ValueError('Invalid process query')
            emit({'processIdentity':birth(message['pid'])})
    finally:k.ReleaseMutex(mutex);k.CloseHandle(mutex)
except Exception as e:
    emit({'error':'PROCESS_IDENTITY_UNAVAILABLE','message':str(e)});sys.exit(1)
