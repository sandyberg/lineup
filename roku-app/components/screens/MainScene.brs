sub Init()
    m.guidePanel = m.top.FindNode("guidePanel")
    m.settingsPanel = m.top.FindNode("settingsPanel")
    m.sportPillsGroup = m.top.FindNode("sportPillsGroup")
    m.eventsGroup = m.top.FindNode("eventsGroup")
    m.loadingLabel = m.top.FindNode("loadingLabel")
    m.emptyLabel = m.top.FindNode("emptyLabel")
    m.dateLabel = m.top.FindNode("dateLabel")
    m.serviceListGroup = m.top.FindNode("serviceListGroup")

    m.currentTab = 0
    m.sportFilterIdx = 0
    m.allEvents = []
    m.scrollOffset = 0
    m.maxScroll = 0
    m.selectedServices = GetSelectedServices()
    m.settingsFocusIdx = 0

    m.cardGrid = []
    m.focusRow = 0
    m.focusCol = 0
    m.focusMode = "filter"
    m.sportPills = []

    m.pickerOverlay = m.top.FindNode("pickerOverlay")
    m.pickerBox = m.top.FindNode("pickerBox")
    m.pickerItemsGroup = m.top.FindNode("pickerItemsGroup")
    m.pickerSubtitle = m.top.FindNode("pickerSubtitle")
    m.pickerServices = []

    m.EVENTS_BASE_Y = 120
    ' Wider cards; 3+ in All Sports = horizontal pan inside viewport
    m.CARD_W = 350
    m.CARD_H = 200
    m.CARD_H_GAP = 12
    m.CARD_V_GAP = 12
    m.CARDS_PER_ROW = 3
    m.ROW_VIEW_W = 1150

    m.dateLabel.text = GetTodayDateString()
    buildSportPills()

    m.fetchTask = m.top.FindNode("fetchTask")
    m.fetchTask.ObserveField("content", "onEventsLoaded")
    m.fetchTask.ObserveField("error", "onFetchError")

    buildServiceList()
    m.fetchTask.control = "run"
    m.top.SetFocus(true)
    updateSportPillVisuals()
end sub

' --- SPORT FILTER PILLS ---

sub buildSportPills()
    filters = GetSportFilters()
    xPos = 0
    for i = 0 to filters.Count() - 1
        f = filters[i]
        label = f.label
        pillW = 55 + Len(label) * 6
        if pillW < 60 then pillW = 60

        pill = CreateObject("roSGNode", "Rectangle")
        pill.width = pillW
        pill.height = 34
        pill.color = "#1A1F2E"
        pill.translation = [xPos, 0]

        pillLbl = CreateObject("roSGNode", "Label")
        pillLbl.text = label
        pillLbl.font = "font:SmallestBoldSystemFont"
        pillLbl.color = "#8B95A5"
        pillLbl.width = pillW
        pillLbl.horizAlign = "center"
        pillLbl.translation = [0, 7]
        pill.AppendChild(pillLbl)

        m.sportPillsGroup.AppendChild(pill)
        m.sportPills.Push({ node: pill, lbl: pillLbl, width: pillW })

        xPos = xPos + pillW + 10
    end for
end sub

sub updateSportPillVisuals()
    for i = 0 to m.sportPills.Count() - 1
        pill = m.sportPills[i]
        if i = m.sportFilterIdx
            if m.focusMode = "filter"
                pill.node.color = "#FFFFFF"
                pill.lbl.color = "#0D1117"
            else
                pill.node.color = "#252D3D"
                pill.lbl.color = "#FFFFFF"
            end if
        else
            pill.node.color = "#1A1F2E"
            pill.lbl.color = "#8B95A5"
        end if
    end for
end sub

sub cycleSport(direction as Integer)
    filters = GetSportFilters()
    m.sportFilterIdx = m.sportFilterIdx + direction
    if m.sportFilterIdx < 0 then m.sportFilterIdx = filters.Count() - 1
    if m.sportFilterIdx >= filters.Count() then m.sportFilterIdx = 0
    updateSportPillVisuals()
    m.scrollOffset = 0
    m.focusRow = 0
    m.focusCol = 0
    filterAndDisplayEvents()
end sub

' --- DATA ---

sub onEventsLoaded()
    m.loadingLabel.visible = false
    rawContent = m.fetchTask.content
    if rawContent = invalid or rawContent.GetChildCount() = 0
        m.emptyLabel.visible = true
        return
    end if

    m.allEvents = []
    for i = 0 to rawContent.GetChildCount() - 1
        m.allEvents.Push(rawContent.GetChild(i))
    end for
    filterAndDisplayEvents()
end sub

sub onFetchError()
    m.loadingLabel.text = m.fetchTask.error
end sub

' --- FILTERING ---

sub filterAndDisplayEvents()
    filters = GetSportFilters()
    currentSport = "all"
    if m.sportFilterIdx >= 0 and m.sportFilterIdx < filters.Count()
        currentSport = filters[m.sportFilterIdx].id
    end if

    selectedSvcSet = {}
    for each svcId in m.selectedServices
        selectedSvcSet[svcId] = true
    end for

    filtered = []
    for each evt in m.allEvents
        shouldInclude = true
        status = "upcoming"
        if evt.HasField("status") and evt.status <> invalid then status = evt.status
        if status = "final" then shouldInclude = false

        sport = ""
        if evt.HasField("sport") and evt.sport <> invalid then sport = evt.sport
        if shouldInclude and currentSport <> "all" and sport <> currentSport
            shouldInclude = false
        end if

        if shouldInclude
            hasService = false
            csv = ""
            if evt.HasField("servicesCsv") and evt.servicesCsv <> invalid
                csv = evt.servicesCsv
            end if
            svcIds = SplitCsv(csv)
            if svcIds.Count() > 0
                for each svcId in svcIds
                    if selectedSvcSet.DoesExist(svcId)
                        hasService = true
                        exit for
                    end if
                end for
            else
                hasService = true
            end if
            if hasService then filtered.Push(evt)
        end if
    end for

    displayEvents(filtered, currentSport)
end sub

' Horizontal scroll in All Sports row (m.rowHContent) so 4+ games stay reachable
sub updateRowHScroll(rowIdx as Integer, focusCol as Integer)
    if m.rowHContent = invalid or rowIdx < 0 or rowIdx >= m.rowHContent.Count() then return
    rc = m.rowHContent[rowIdx]
    if rc = invalid then return
    if rowIdx >= m.cardGrid.Count() then return
    row = m.cardGrid[rowIdx]
    n = row.Count()
    vW = m.ROW_VIEW_W
    ' BrightScript: "step" is reserved (for ... step)
    cardStep = m.CARD_W + m.CARD_H_GAP
    if n = 0 then return
    totalW = n * m.CARD_W
    if n > 1 then totalW = totalW + (n - 1) * m.CARD_H_GAP
    minH = vW - totalW
    if minH > 0 then minH = 0
    c = focusCol
    if c < 0 then c = 0
    if c > n - 1 then c = n - 1
    cardL = c * cardStep
    cent = (vW - m.CARD_W) / 2
    h = cent - cardL
    if h < minH then h = minH
    if h > 0 then h = 0
    ' (Do not index-assign m.rowHScroll; roList from "[]" can throw at runtime. Translation is the source of truth.)
    rowTy = 8
    t0 = rc.translation
    if t0 <> invalid and t0.Count() > 1 then rowTy = t0[1]
    rc.translation = [h, rowTy]
    cL = m.rowChevronL[rowIdx]
    cR = m.rowChevronR[rowIdx]
    if cL = invalid or cR = invalid then return
    cL.visible = h < 0
    cR.visible = h > minH
    ' Use explicit compare (some Roku BS builds reject "if not (expr)")
    if totalW <= m.ROW_VIEW_W then
        cL.visible = false
        cR.visible = false
    end if
end sub

' --- RENDERING ---

sub displayEvents(events as Object, currentSport as String)
    m.eventsGroup.RemoveChildrenIndex(m.eventsGroup.GetChildCount(), 0)
    m.cardGrid = []
    m.cardRowBaseY = []
    m.rowHContent = []
    m.rowChevronL = []
    m.rowChevronR = []

    if events.Count() = 0
        m.emptyLabel.visible = true
        return
    end if
    m.emptyLabel.visible = false

    if currentSport = "all"
        renderBySport(events)
    else
        renderByTime(events)
    end if

    m.scrollOffset = 0
    m.eventsGroup.translation = [60, m.EVENTS_BASE_Y]
    if m.focusMode = "cards" then updateCardFocus()
end sub

sub renderBySport(events as Object)
    sportOrder = ["nfl", "nba", "mlb", "nhl", "soccer", "college-football", "college-basketball", "mma", "golf", "tennis", "racing", "other"]
    sportLabels = {
        "nfl": "NFL", "nba": "NBA", "mlb": "MLB", "nhl": "NHL",
        "soccer": "Soccer", "college-football": "College Football",
        "college-basketball": "College Basketball", "mma": "MMA",
        "golf": "Golf", "tennis": "Tennis", "racing": "Racing", "other": "Other"
    }

    bySport = {}
    for each evt in events
        sport = "other"
        if evt.HasField("sport") and evt.sport <> invalid and evt.sport <> ""
            sport = evt.sport
        end if
        if not bySport.DoesExist(sport) then bySport[sport] = []
        bySport[sport].Push(evt)
    end for

    yPos = 0
    for each sport in sportOrder
        if bySport.DoesExist(sport) and bySport[sport].Count() > 0
            sportEvents = bySport[sport]
            liveCount = 0
            for each e in sportEvents
                if e.HasField("status") and e.status = "live"
                    liveCount = liveCount + 1
                end if
            end for

            label = sportLabels[sport]
            if label = invalid then label = sport
            if liveCount > 0
                label = label + " (" + liveCount.ToStr() + " LIVE)"
            end if

            countGames = sportEvents.Count()

            ' One header row: sport (left) and optional "N games..." (right) — not stacked
            sLbl = CreateObject("roSGNode", "Label")
            sLbl.text = label
            sLbl.font = "font:SmallBoldSystemFont"
            sLbl.color = "#FFFFFF"
            sLbl.width = 520
            sLbl.translation = [0, yPos]
            m.eventsGroup.AppendChild(sLbl)
            if countGames > 3
                capR = CreateObject("roSGNode", "Label")
                capR.text = countGames.ToStr() + " games. Press right arrow to see more"
                capR.font = "font:SmallestSystemFont"
                capR.color = "#6B7A8C"
                capR.width = m.ROW_VIEW_W - 520
                capR.horizAlign = "right"
                capR.translation = [520, yPos]
                m.eventsGroup.AppendChild(capR)
            end if
            yPos = yPos + 30

            rowY = yPos
            rowShell = CreateObject("roSGNode", "Group")
            rowShell.translation = [0, rowY]
            ' Group clipping/width/height are not reliable across Roku OS builds; avoid

            cL = CreateObject("roSGNode", "Label")
            cL.id = "rowChevL"
            cL.text = "<<"
            cL.font = "font:MediumSystemFont"
            cL.color = "#5C6B7E"
            cL.visible = false
            cR = CreateObject("roSGNode", "Label")
            cR.id = "rowChevR"
            cR.text = ">>"
            cR.font = "font:MediumSystemFont"
            cR.color = "#5C6B7E"
            cR.visible = false

            rowContentY = 8
            chY = rowContentY + 70
            cL.translation = [2, chY]
            cR.translation = [m.ROW_VIEW_W - 30, chY]

            rowContent = CreateObject("roSGNode", "Group")
            rowContent.translation = [0, rowContentY]
            rowShell.AppendChild(rowContent)
            rowShell.AppendChild(cL)
            rowShell.AppendChild(cR)

            rowCards = []
            xPos = 0
            for each evt in sportEvents
                card = buildCard(evt, xPos, 0)
                rowContent.AppendChild(card)
                rowCards.Push({ node: card, evt: evt })
                xPos = xPos + m.CARD_W + m.CARD_H_GAP
            end for
            m.cardGrid.Push(rowCards)
            m.cardRowBaseY.Push(rowY + rowContentY)
            m.rowHContent.Push(rowContent)
            m.rowChevronL.Push(cL)
            m.rowChevronR.Push(cR)
            m.eventsGroup.AppendChild(rowShell)

            rowIdx = m.rowHContent.Count() - 1
            totalRowW = countGames * m.CARD_W
            if countGames > 1
                totalRowW = totalRowW + (countGames - 1) * m.CARD_H_GAP
            end if
            if totalRowW > m.ROW_VIEW_W
                updateRowHScroll(rowIdx, 0)
            else
                cL.visible = false
                cR.visible = false
            end if

            yPos = yPos + m.CARD_H + 28
        end if
    end for

    m.maxScroll = yPos - 550
    if m.maxScroll < 0 then m.maxScroll = 0
end sub

sub renderByTime(events as Object)
    liveNow = []
    startingSoon = []
    laterToday = []
    tomorrow = []

    now = CreateObject("roDateTime")
    nowSec = now.AsSeconds()
    now.ToLocalTime()
    todayDay = now.GetDayOfMonth()

    for each evt in events
        status = "upcoming"
        if evt.HasField("status") and evt.status <> invalid then status = evt.status

        if status = "live"
            liveNow.Push(evt)
        else
            startTime = ""
            if evt.HasField("startTime") and evt.startTime <> invalid
                startTime = evt.startTime
            end if
            if startTime <> ""
                evtDt = CreateObject("roDateTime")
                evtDt.FromISO8601String(startTime)
                evtSec = evtDt.AsSeconds()
                diffMin = (evtSec - nowSec) / 60

                evtDt.ToLocalTime()
                evtDay = evtDt.GetDayOfMonth()

                if diffMin <= 60 and diffMin > 0
                    startingSoon.Push(evt)
                else if evtDay = todayDay
                    laterToday.Push(evt)
                else
                    tomorrow.Push(evt)
                end if
            else
                laterToday.Push(evt)
            end if
        end if
    end for

    yPos = 0

    if liveNow.Count() > 0
        yPos = renderTimeSection("Live Now", liveNow.Count(), liveNow, yPos, true)
    end if
    if startingSoon.Count() > 0
        yPos = renderTimeSection("Starting Soon", startingSoon.Count(), startingSoon, yPos, false)
    end if
    if laterToday.Count() > 0
        yPos = renderTimeSection("Later Today", laterToday.Count(), laterToday, yPos, false)
    end if
    if tomorrow.Count() > 0
        yPos = renderTimeSection("Tomorrow", tomorrow.Count(), tomorrow, yPos, false)
    end if

    m.maxScroll = yPos - 550
    if m.maxScroll < 0 then m.maxScroll = 0
end sub

sub pushTimeRowToGrid(rowCards as Object)
    m.cardGrid.Push(rowCards)
    if rowCards = invalid or rowCards.Count() = 0 then return
    b = rowCards[0].node.translation[1]
    m.cardRowBaseY.Push(b)
    m.rowHContent.Push(invalid)
    m.rowChevronL.Push(invalid)
    m.rowChevronR.Push(invalid)
end sub

function renderTimeSection(title as String, count as Integer, events as Object, yPos as Integer, isLive as Boolean) as Integer
    ' One horizontal band: title, LIVE chip; "N games" one px below title (between same-y and +3)
    rowY = yPos + 1
    subY = rowY + 1
    titleLbl = CreateObject("roSGNode", "Label")
    titleLbl.text = title
    titleLbl.font = "font:MediumBoldSystemFont"
    titleLbl.color = "#FFFFFF"
    titleLbl.translation = [0, rowY]
    m.eventsGroup.AppendChild(titleLbl)

    if isLive
        liveBadge = CreateObject("roSGNode", "Rectangle")
        liveBadge.width = 65
        liveBadge.height = 24
        liveBadge.color = "#FF3B30"
        liveBadge.translation = [180, rowY]
        liveLbl = CreateObject("roSGNode", "Label")
        liveLbl.text = count.ToStr() + " LIVE"
        liveLbl.font = "font:SmallestBoldSystemFont"
        liveLbl.color = "#FFFFFF"
        liveLbl.translation = [8, 4]
        liveBadge.AppendChild(liveLbl)
        m.eventsGroup.AppendChild(liveBadge)
    end if

    suffix = " game"
    if count <> 1 then suffix = " games"
    subLbl = CreateObject("roSGNode", "Label")
    subLbl.font = "font:SmallSystemFont"
    subLbl.color = "#8B95A5"
    if isLive
        subLbl.translation = [255, subY]
    else
        subLbl.translation = [180, subY]
    end if
    subLbl.text = count.ToStr() + suffix
    m.eventsGroup.AppendChild(subLbl)
    yPos = yPos + 38

    rowCards = []
    xPos = 0
    cardCount = 0
    for each evt in events
        if cardCount > 0 and cardCount mod m.CARDS_PER_ROW = 0
            m.cardGrid.Push(rowCards)
            rowCards = []
            yPos = yPos + m.CARD_H + m.CARD_V_GAP
            xPos = 0
        end if

        card = buildCard(evt, xPos, yPos)
        m.eventsGroup.AppendChild(card)
        rowCards.Push({ node: card, evt: evt })
        xPos = xPos + m.CARD_W + m.CARD_H_GAP
        cardCount = cardCount + 1
    end for

    if rowCards.Count() > 0 then pushTimeRowToGrid(rowCards)
    yPos = yPos + m.CARD_H + 20
    return yPos
end function

' --- CARD BUILDER ---

function buildCard(evt as Object, xPos as Integer, yPos as Integer) as Object
    cardW = m.CARD_W
    cardH = m.CARD_H

    card = CreateObject("roSGNode", "Rectangle")
    card.width = cardW
    card.height = cardH
    card.color = "#1A1F2E"
    card.translation = [xPos, yPos]

    status = "upcoming"
    if evt.HasField("status") and evt.status <> invalid and evt.status <> ""
        status = evt.status
    end if

    ' Inset the pill from card edge; leave room for background past the text (no label width = no ellipsis)
    badgeLeftX = 8
    badge = CreateObject("roSGNode", "Rectangle")
    badge.translation = [badgeLeftX, 12]
    badge.height = 24
    badgeTxt = CreateObject("roSGNode", "Label")
    badgeTxt.translation = [6, 3]
    badgeTxt.font = "font:SmallestSystemFont"
    badgeTxt.color = "#FFFFFF"

    padH = 6
    if status = "live"
        badge.color = "#FF3B30"
        liveT = chr(9679) + " LIVE"
        badgeTxt.text = liveT
        textW = MeasureSmallestSystemFontLineWidth(liveT)
        if textW < 1 then textW = 50
        ' Slightly less padding on the right; bullet + roFont vs Label left more room on the right
        badgeW = padH + textW + 4
    else if status = "upcoming"
        badge.color = "#2D3548"
        timeStr = ""
        if evt.HasField("startTime") and evt.startTime <> invalid
            timeStr = FormatEventTime(evt.startTime)
        end if
        badgeTxt.text = timeStr
        textW = MeasureSmallestSystemFontLineWidth(timeStr)
        ' If roFont failed, approximate generously so the bar still wraps the time string
        if textW < 1
            textW = 16 + Len(timeStr) * 6
        end if
        badgeW = padH * 2 + textW
        if badgeW < 64 then badgeW = 64
        if badgeW > cardW - badgeLeftX - 8 then badgeW = cardW - badgeLeftX - 8
    else
        badge.color = "#4A5568"
        finalT = "FINAL"
        badgeTxt.text = finalT
        textW = MeasureSmallestSystemFontLineWidth(finalT)
        if textW < 1 then textW = 32
        badgeW = padH * 2 + textW
    end if
    badge.width = badgeW
    badge.AppendChild(badgeTxt)
    card.AppendChild(badge)

    channel = ""
    if evt.HasField("channel") and evt.channel <> invalid then channel = evt.channel
    ' Channel name on the right, next to the time/LIVE badge (right-aligned in its column)
    chGutter = 8
    chW = cardW - chGutter * 2 - badgeLeftX - badge.width - 6
    if chW < 28 then chW = 28
    chLbl = CreateObject("roSGNode", "Label")
    chLbl.translation = [badgeLeftX + badge.width + 6, 14]
    chLbl.width = chW
    chLbl.horizAlign = "right"
    chLbl.font = "font:SmallestSystemFont"
    chLbl.color = "#8B95A5"
    chLbl.text = channel
    card.AppendChild(chLbl)

    homeTeam = ""
    awayTeam = ""
    evtTitle = ""
    if evt.HasField("homeTeam") and evt.homeTeam <> invalid then homeTeam = evt.homeTeam
    if evt.HasField("awayTeam") and evt.awayTeam <> invalid then awayTeam = evt.awayTeam
    if evt.title <> invalid then evtTitle = evt.title

    if homeTeam <> "" and awayTeam <> ""
        hLbl = CreateObject("roSGNode", "Label")
        hLbl.translation = [12, 48]
        hLbl.width = cardW - 70
        hLbl.font = "font:SmallBoldSystemFont"
        hLbl.color = "#FFFFFF"
        hLbl.maxLines = 1
        hLbl.text = GetMascotName(homeTeam)
        card.AppendChild(hLbl)

        aLbl = CreateObject("roSGNode", "Label")
        aLbl.translation = [12, 72]
        aLbl.width = cardW - 70
        aLbl.font = "font:SmallBoldSystemFont"
        aLbl.color = "#FFFFFF"
        aLbl.maxLines = 1
        aLbl.text = GetMascotName(awayTeam)
        card.AppendChild(aLbl)

        if status = "live" or status = "final"
            hs = ""
            as2 = ""
            if evt.HasField("homeScore") and evt.homeScore <> invalid then hs = evt.homeScore
            if evt.HasField("awayScore") and evt.awayScore <> invalid then as2 = evt.awayScore

            hsL = CreateObject("roSGNode", "Label")
            hsL.translation = [cardW - 60, 48]
            hsL.width = 50
            hsL.horizAlign = "right"
            hsL.font = "font:SmallBoldSystemFont"
            hsL.color = "#FFFFFF"
            hsL.text = hs
            card.AppendChild(hsL)

            asL = CreateObject("roSGNode", "Label")
            asL.translation = [cardW - 60, 72]
            asL.width = 50
            asL.horizAlign = "right"
            asL.font = "font:SmallBoldSystemFont"
            asL.color = "#FFFFFF"
            asL.text = as2
            card.AppendChild(asL)
        end if
    else
        tL = CreateObject("roSGNode", "Label")
        tL.translation = [12, 48]
        tL.width = cardW - 24
        tL.font = "font:SmallBoldSystemFont"
        tL.color = "#FFFFFF"
        tL.maxLines = 2
        tL.text = evtTitle
        card.AppendChild(tL)
    end if

    ' Colored service pills at bottom of card
    badgeH = 22
    svcY = cardH - badgeH - 26
    if svcY < 96 then svcY = 96
    svcX = 12
    svcCsv = ""
    if evt.HasField("servicesCsv") and evt.servicesCsv <> invalid
        svcCsv = evt.servicesCsv
    end if
    svcIdList = SplitCsv(svcCsv)
    for each svcId in svcIdList
        svc = GetServiceById(svcId)
        if svc <> invalid
            shortName = svc.name
            if svc.DoesExist("short") then shortName = svc.short
            bw = 80
            if Len(shortName) <= 4 then bw = 60
            if svcX + bw > cardW - 10 then exit for
            svcBg = CreateObject("roSGNode", "Rectangle")
            svcBg.width = bw
            svcBg.height = badgeH
            svcBg.color = svc.color
            svcBg.translation = [svcX, svcY]
            svcLbl = CreateObject("roSGNode", "Label")
            svcLbl.text = shortName
            svcLbl.font = "font:SmallestSystemFont"
            svcLbl.color = "#FFFFFF"
            svcLbl.translation = [4, 2]
            svcLbl.width = bw - 8
            svcLbl.horizAlign = "center"
            svcBg.AppendChild(svcLbl)
            card.AppendChild(svcBg)
            svcX = svcX + bw + 6
        end if
    end for

    watchHint = CreateObject("roSGNode", "Label")
    watchHint.id = "watchHint"
    watchHint.translation = [12, cardH - 22]
    watchHint.font = "font:SmallestSystemFont"
    watchHint.color = "#30D158"
    watchHint.text = "OK for details"
    watchHint.visible = false
    card.AppendChild(watchHint)

    border = CreateObject("roSGNode", "Rectangle")
    border.id = "focusBorder"
    border.width = cardW
    border.height = cardH
    border.color = "#00000000"
    border.visible = false

    bTop = CreateObject("roSGNode", "Rectangle")
    bTop.width = cardW
    bTop.height = 3
    bTop.color = "#FFFFFF"
    border.AppendChild(bTop)

    bBot = CreateObject("roSGNode", "Rectangle")
    bBot.width = cardW
    bBot.height = 3
    bBot.color = "#FFFFFF"
    bBot.translation = [0, cardH - 3]
    border.AppendChild(bBot)

    bLeft = CreateObject("roSGNode", "Rectangle")
    bLeft.width = 3
    bLeft.height = cardH
    bLeft.color = "#FFFFFF"
    border.AppendChild(bLeft)

    bRight = CreateObject("roSGNode", "Rectangle")
    bRight.width = 3
    bRight.height = cardH
    bRight.color = "#FFFFFF"
    bRight.translation = [cardW - 3, 0]
    border.AppendChild(bRight)

    card.AppendChild(border)
    return card
end function

' --- CARD FOCUS ---

sub updateCardFocus()
    for r = 0 to m.cardGrid.Count() - 1
        row = m.cardGrid[r]
        for c = 0 to row.Count() - 1
            cardInfo = row[c]
            isFocused = (r = m.focusRow and c = m.focusCol and m.focusMode = "cards")
            if isFocused
                cardInfo.node.color = "#252D3D"
            else
                cardInfo.node.color = "#1A1F2E"
            end if
            childCount = cardInfo.node.GetChildCount()
            for i = 0 to childCount - 1
                child = cardInfo.node.GetChild(i)
                if child.id = "watchHint" then child.visible = isFocused
                if child.id = "focusBorder" then child.visible = isFocused
            end for
        end for
    end for

    if m.cardGrid.Count() > 0 and m.focusRow < m.cardGrid.Count()
        row = m.cardGrid[m.focusRow]
        if m.focusCol < row.Count()
            cardInfo = row[m.focusCol]
            if m.cardRowBaseY.Count() = m.cardGrid.Count() and m.focusRow < m.cardRowBaseY.Count()
                cardY = m.cardRowBaseY[m.focusRow]
            else
                cardY = cardInfo.node.translation[1]
            end if
            visibleTop = m.scrollOffset
            visibleBottom = m.scrollOffset + 550

            if cardY < visibleTop
                m.scrollOffset = cardY - 30
                if m.scrollOffset < 0 then m.scrollOffset = 0
            else if cardY + m.CARD_H > visibleBottom
                m.scrollOffset = cardY + m.CARD_H - 550
            end if
            m.eventsGroup.translation = [60, m.EVENTS_BASE_Y - m.scrollOffset]

            if m.rowHContent <> invalid and m.focusRow < m.rowHContent.Count()
                rch = m.rowHContent[m.focusRow]
                if rch <> invalid
                    updateRowHScroll(m.focusRow, m.focusCol)
                end if
            end if
        end if
    end if

    updateSportPillVisuals()
end sub

sub launchSelectedCard()
    if m.cardGrid.Count() = 0 then return
    if m.focusRow < 0 or m.focusRow >= m.cardGrid.Count() then return
    row = m.cardGrid[m.focusRow]
    if m.focusCol < 0 or m.focusCol >= row.Count() then return

    cardInfo = row[m.focusCol]
    if cardInfo = invalid or cardInfo.evt = invalid then return

    evt = cardInfo.evt
    csv = ""
    if evt.HasField("servicesCsv") and evt.servicesCsv <> invalid
        csv = evt.servicesCsv
    end if
    svcIds = SplitCsv(csv)
    if svcIds.Count() = 0 then return

    matched = []
    for each svcId in svcIds
        svc = GetServiceById(svcId)
        if svc <> invalid then matched.Push(svc)
    end for

    if matched.Count() = 0 then return
    showServicePicker(matched)
end sub

sub showServicePicker(services as Object)
    m.pickerServices = services
    m.pickerItemsGroup.RemoveChildrenIndex(m.pickerItemsGroup.GetChildCount(), 0)

    if services.Count() = 1
        m.pickerSubtitle.text = "Open " + services[0].name + " to watch"
    else
        m.pickerSubtitle.text = "Open one of these apps to watch"
    end if

    yPos = 0
    for each svc in services
        row = CreateObject("roSGNode", "Rectangle")
        row.width = 380
        row.height = 38
        row.color = "#1A1F2E"
        row.translation = [0, yPos]

        dot = CreateObject("roSGNode", "Rectangle")
        dot.width = 10
        dot.height = 10
        dot.color = svc.color
        dot.translation = [14, 14]
        row.AppendChild(dot)

        lbl = CreateObject("roSGNode", "Label")
        lbl.text = svc.name
        lbl.font = "font:SmallSystemFont"
        lbl.color = "#C7C7CC"
        lbl.translation = [34, 8]
        lbl.width = 330
        row.AppendChild(lbl)

        m.pickerItemsGroup.AppendChild(row)
        yPos = yPos + 42
    end for

    btnY = yPos + 14
    btn = CreateObject("roSGNode", "Rectangle")
    btn.width = 380
    btn.height = 44
    btn.color = "#2C7BE5"
    btn.translation = [0, btnY]

    btnLbl = CreateObject("roSGNode", "Label")
    btnLbl.text = "OK to exit and switch apps"
    btnLbl.font = "font:SmallBoldSystemFont"
    btnLbl.color = "#FFFFFF"
    btnLbl.width = 380
    btnLbl.horizAlign = "center"
    btnLbl.translation = [0, 10]
    btn.AppendChild(btnLbl)
    m.pickerItemsGroup.AppendChild(btn)

    boxH = 110 + services.Count() * 42 + 72
    if boxH > 520 then boxH = 520
    m.pickerBox.height = boxH
    m.pickerBox.translation = [410, (720 - boxH) / 2]

    m.focusMode = "picker"
    m.pickerOverlay.visible = true
end sub

sub hideServicePicker()
    m.pickerOverlay.visible = false
    m.focusMode = "cards"
    updateCardFocus()
end sub

' --- SETTINGS ---

sub buildServiceList()
    m.serviceListGroup.RemoveChildrenIndex(m.serviceListGroup.GetChildCount(), 0)
    services = GetStreamingServices()
    m.serviceToggles = []

    yPos = 0
    for each svc in services
        row = CreateObject("roSGNode", "Rectangle")
        row.width = 500
        row.height = 44
        row.color = "#1A1F2E"
        row.translation = [0, yPos]

        isSelected = false
        for each selId in m.selectedServices
            if selId = svc.id then isSelected = true
        end for

        checkLbl = CreateObject("roSGNode", "Label")
        checkLbl.translation = [14, 10]
        checkLbl.font = "font:SmallSystemFont"
        checkLbl.color = "#30D158"
        if isSelected
            checkLbl.text = chr(10003)
        else
            checkLbl.text = " "
        end if

        nameLbl = CreateObject("roSGNode", "Label")
        nameLbl.translation = [44, 10]
        nameLbl.font = "font:SmallSystemFont"
        nameLbl.color = "#FFFFFF"
        nameLbl.text = svc.name

        colorDot = CreateObject("roSGNode", "Rectangle")
        colorDot.width = 10
        colorDot.height = 10
        colorDot.color = svc.color
        colorDot.translation = [478, 17]

        row.AppendChild(checkLbl)
        row.AppendChild(nameLbl)
        row.AppendChild(colorDot)
        m.serviceListGroup.AppendChild(row)

        m.serviceToggles.Push({
            node: row,
            checkLbl: checkLbl,
            svcId: svc.id,
            selected: isSelected
        })
        yPos = yPos + 50
    end for
    updateSettingsFocus()
end sub

sub updateSettingsFocus()
    for i = 0 to m.serviceToggles.Count() - 1
        toggle = m.serviceToggles[i]
        if i = m.settingsFocusIdx
            toggle.node.color = "#252D3D"
        else
            toggle.node.color = "#1A1F2E"
        end if
    end for
end sub

sub toggleService()
    if m.settingsFocusIdx < 0 or m.settingsFocusIdx >= m.serviceToggles.Count()
        return
    end if
    toggle = m.serviceToggles[m.settingsFocusIdx]
    toggle.selected = not toggle.selected
    m.serviceToggles[m.settingsFocusIdx] = toggle
    if toggle.selected
        toggle.checkLbl.text = chr(10003)
    else
        toggle.checkLbl.text = " "
    end if
    newSelected = []
    for each t in m.serviceToggles
        if t.selected then newSelected.Push(t.svcId)
    end for
    m.selectedServices = newSelected
    SaveSelectedServices(newSelected)
end sub

' --- TAB SWITCHING ---

sub showGuide()
    m.currentTab = 0
    m.guidePanel.visible = true
    m.settingsPanel.visible = false
    m.focusMode = "filter"
    m.top.SetFocus(true)
    updateSportPillVisuals()
    filterAndDisplayEvents()
end sub

sub showSettings()
    m.currentTab = 1
    m.guidePanel.visible = false
    m.settingsPanel.visible = true
    m.settingsFocusIdx = 0
    m.top.SetFocus(true)
    updateSettingsFocus()
end sub

' --- DEEP LINKING ---

function handleDeepLink(params as Object) as Boolean
    ' Roku certification: do not launch other channels; LaunchChannel is not a built-in.
    return false
end function

' --- KEY HANDLING ---

function OnKeyEvent(key as String, press as Boolean) as Boolean
    if not press then return false

    if m.focusMode = "picker"
        return handlePickerKeys(key)
    end if

    if key = "options"
        if m.currentTab = 0
            showSettings()
        else
            showGuide()
        end if
        return true
    end if

    if m.currentTab = 0
        return handleGuideKeys(key)
    else
        return handleSettingsKeys(key)
    end if
end function

function handleGuideKeys(key as String) as Boolean
    if m.focusMode = "filter"
        if key = "left"
            cycleSport(-1)
            return true
        end if
        if key = "right"
            cycleSport(1)
            return true
        end if
        if key = "down"
            if m.cardGrid.Count() > 0
                m.focusMode = "cards"
                m.focusRow = 0
                m.focusCol = 0
                updateCardFocus()
            end if
            return true
        end if
        if key = "OK"
            showSettings()
            return true
        end if
        return false
    end if

    if m.focusMode = "cards"
        if key = "up"
            if m.focusRow > 0
                m.focusRow = m.focusRow - 1
                row = m.cardGrid[m.focusRow]
                if m.focusCol >= row.Count() then m.focusCol = row.Count() - 1
                updateCardFocus()
            else
                m.focusMode = "filter"
                m.scrollOffset = 0
                m.eventsGroup.translation = [60, m.EVENTS_BASE_Y]
                updateCardFocus()
                updateSportPillVisuals()
            end if
            return true
        end if

        if key = "down"
            if m.focusRow < m.cardGrid.Count() - 1
                m.focusRow = m.focusRow + 1
                row = m.cardGrid[m.focusRow]
                if m.focusCol >= row.Count() then m.focusCol = row.Count() - 1
                updateCardFocus()
            end if
            return true
        end if

        if key = "left"
            if m.focusCol > 0
                m.focusCol = m.focusCol - 1
                updateCardFocus()
            end if
            return true
        end if

        if key = "right"
            row = m.cardGrid[m.focusRow]
            if m.focusCol < row.Count() - 1
                m.focusCol = m.focusCol + 1
                updateCardFocus()
            end if
            return true
        end if

        if key = "OK"
            launchSelectedCard()
            return true
        end if

        if key = "back"
            m.focusMode = "filter"
            m.scrollOffset = 0
            m.eventsGroup.translation = [60, m.EVENTS_BASE_Y]
            updateCardFocus()
            updateSportPillVisuals()
            return true
        end if

        if key = "replay" or key = "play"
            m.loadingLabel.visible = true
            m.loadingLabel.text = "Refreshing..."
            m.emptyLabel.visible = false
            m.fetchTask.control = "run"
            return true
        end if
    end if

    return false
end function

function handleSettingsKeys(key as String) as Boolean
    if key = "back" or key = "options"
        showGuide()
        return true
    end if
    if key = "up"
        if m.settingsFocusIdx > 0
            m.settingsFocusIdx = m.settingsFocusIdx - 1
            updateSettingsFocus()
        end if
        return true
    end if
    if key = "down"
        if m.settingsFocusIdx < m.serviceToggles.Count() - 1
            m.settingsFocusIdx = m.settingsFocusIdx + 1
            updateSettingsFocus()
        end if
        return true
    end if
    if key = "OK"
        toggleService()
        return true
    end if
    return false
end function

function handlePickerKeys(key as String) as Boolean
    if key = "OK"
        m.top.exitApp = true
        return true
    end if
    if key = "back"
        hideServicePicker()
        return true
    end if
    return true
end function
