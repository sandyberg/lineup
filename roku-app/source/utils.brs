function GetApiBaseUrl() as String
    return "https://lineup-api-31li.onrender.com"
end function

function GetApiKey() as String
    return ""
end function

' Match tv-guide-app `formatEventTime` (date context: today, tomorrow, else weekday)
function FormatEventTime(isoTimestamp as String) as String
    if isoTimestamp = "" or isoTimestamp = invalid then return ""

    now = CreateObject("roDateTime")
    now.ToLocalTime()
    ev = CreateObject("roDateTime")
    ev.FromISO8601String(isoTimestamp)
    ev.ToLocalTime()

    hours = ev.GetHours()
    minutes = ev.GetMinutes()
    ampm = "AM"
    if hours >= 12
        ampm = "PM"
        if hours > 12 then hours = hours - 12
    end if
    if hours = 0 then hours = 12
    minuteStr = minutes.ToStr()
    if minutes < 10 then minuteStr = "0" + minuteStr
    timePart = hours.ToStr() + ":" + minuteStr + " " + ampm

    ' Same calendar day as now
    if now.GetYear() = ev.GetYear() and now.GetMonth() = ev.GetMonth() and now.GetDayOfMonth() = ev.GetDayOfMonth()
        return timePart
    end if
    ' Tomorrow in local time (add 24h; good enough for guide times)
    tom = CreateObject("roDateTime")
    tom.FromSeconds(now.AsSeconds() + 24 * 60 * 60)
    tom.ToLocalTime()
    if ev.GetYear() = tom.GetYear() and ev.GetMonth() = tom.GetMonth() and ev.GetDayOfMonth() = tom.GetDayOfMonth()
        return "Tomorrow " + timePart
    end if
    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    w = ev.GetDayOfWeek()
    if w < 0 or w > 6 then w = 0
    return days[w] + " " + timePart
end function

function GetTodayDateString() as String
    dt = CreateObject("roDateTime")
    dt.ToLocalTime()
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dt.GetDayOfWeek()] + ", " + months[dt.GetMonth() - 1] + " " + dt.GetDayOfMonth().ToStr()
end function

function GetStatusColor(status as String) as String
    if status = "live" then return "#FF3B30"
    if status = "upcoming" then return "#30D158"
    return "#8E8E93"
end function

function GetStatusLabel(status as String) as String
    if status = "live" then return "LIVE"
    if status = "upcoming" then return FormatEventTime(m.top.startTime)
    return "FINAL"
end function

function GetMascotName(fullName as String) as String
    if fullName = invalid or fullName = "" then return ""
    lastSpace = 0
    for i = 1 to Len(fullName)
        if Mid(fullName, i, 1) = " " then lastSpace = i
    end for
    if lastSpace > 0 and lastSpace < Len(fullName)
        return Mid(fullName, lastSpace + 1)
    end if
    return fullName
end function

' One line of text width for default font (matches `font:SmallestSystemFont` in Labels). Padding in MainScene.
function MeasureSmallestSystemFontLineWidth(txt as String) as Integer
    if txt = invalid or txt = "" then return 0
    reg = CreateObject("roFontRegistry")
    if reg = invalid then return 0
    font = reg.GetDefaultFont(20, false, false)
    if font = invalid then return 0
    w = font.GetOneLineWidth(txt, 10000)
    if w = invalid or w < 1 then return 0
    ' tiny slack: SG Label can be 1-2px wider than roFont on some builds
    return w + 2
end function

function SplitCsv(csv as String) as Object
    result = []
    if csv = invalid or csv = "" then return result
    current = ""
    for i = 0 to Len(csv) - 1
        ch = Mid(csv, i + 1, 1)
        if ch = ","
            if current <> "" then result.Push(current)
            current = ""
        else
            current = current + ch
        end if
    end for
    if current <> "" then result.Push(current)
    return result
end function


function ReadRegistrySetting(section as String, key as String) as Dynamic
    sec = CreateObject("roRegistrySection", section)
    if sec.Exists(key)
        return sec.Read(key)
    end if
    return invalid
end function

sub WriteRegistrySetting(section as String, key as String, value as String)
    sec = CreateObject("roRegistrySection", section)
    sec.Write(key, value)
    sec.Flush()
end sub
