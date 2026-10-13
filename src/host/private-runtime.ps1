param([Parameter(Mandatory=$true)][string]$RuntimeDirectory)
$ErrorActionPreference='Stop'
$resolved=[IO.Path]::GetFullPath($RuntimeDirectory)
$item=[IO.DirectoryInfo]::new($resolved)
if($item.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Runtime cannot be a link'}
$currentSid=[Security.Principal.WindowsIdentity]::GetCurrent().User
$acl=[Security.AccessControl.DirectorySecurity]::new()
$acl.SetOwner($currentSid)
$acl.SetAccessRuleProtection($true,$false)
foreach($sid in @($currentSid,[Security.Principal.SecurityIdentifier]::new('S-1-5-18'))){
 $rule=[Security.AccessControl.FileSystemAccessRule]::new($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow')
 $acl.AddAccessRule($rule)
}
[IO.Directory]::SetAccessControl($resolved,$acl)
$checked=[IO.Directory]::GetAccessControl($resolved)
if(-not $checked.AreAccessRulesProtected){throw 'Runtime inheritance is not protected'}
foreach($rule in $checked.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])){
 if($rule.IdentityReference.Value -ne $currentSid.Value -and $rule.IdentityReference.Value -ne 'S-1-5-18'){throw 'Unexpected runtime access rule'}
}
