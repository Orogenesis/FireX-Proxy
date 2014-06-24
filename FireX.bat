for %%* in (.) do set CurrDirName=%%~n*
IF EXIST %CurrDirName%.xpi (
	del %CurrDirName%.xpi
	echo %CurrDirName%.xpi is deleted.
)
7z a -tzip %CurrDirName%.xpi
pause