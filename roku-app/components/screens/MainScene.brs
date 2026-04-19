sub Init()
    m.guidePanel = m.top.FindNode("guidePanel")
    m.settingsPanel = m.top.FindNode("settingsPanel")
    m.sportFilter = m.top.FindNode("sportFilter")
    m.eventsGroup = m.top.FindNode("eventsGroup")
    m.loadingLabel = m.top.FindNode("loadingLabel")
    m.emptyLabel = m.top.FindNode("emptyLabel")
    m.dateLabel = m.top.FindNode("dateLabel")
    m.serviceListGroup = m.top.FindNode("serviceListGroup")

    m.currentTab = 0
    m.currentSport = "all"
    m.allEvents = []
    m.scrollOffset = 0
    m.maxScroll = 0
    m.selectedServices = GetSelectedServices()
    m.settingsFocusIdx = 0

    m.cardGrid = []
    m.focusRow = 0
    m.focusCol = 0
    m.focusMode = "filter"

    m.dateLabel.text = GetTodayDateString()

    filters = GetSportFilters()
    filterLabels = []
    for each f in filters
        filterLabels.Push(f.label)
    end for
    m.sportFilter.buttons = filterLabels
    m.sportFilter.ObserveField("buttonSelected", "onSportSelected")

    m.fetchTask = m.top.FindNode("fetchTask")
    m.fetchTask.ObserveField("content", "onEventsLoaded")
    m.fetchTask.ObserveField("error", "onFetchError")

    buildServiceList()
    m.fetchTask.control = "run"
    m.sportFilter.SetFocus(true)
end sub

' ─── DATA ───

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

sub onSportSelected()
    idx = m.sportFilter.buttonSelected
    filters = GetSportFilters()
    if idx >= 0 and idx < filters.Count()
        m.currentSport = filters[idx].id
        m.scrollOffset = 0
        m.focusRow = 0
        m.focusCol = 0
        filterAndDisplayEvents()
    end if
end sub

' ─── FILTERING ───

sub filterAndDisplayEvents()
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
        if shouldInclude and m.currentSport <> "all" and sport <> m.currentSport
            shouldInclude = false
        end if

        if shouldInclude
            hasService = false
            services = invalid
            if evt.HasField("availableServices") then services = evt.availableServices
            if services <> invalid
                for each svcId in services
                    if selectedSvcSet.DoesExist(svcId)
                        hasService = true
                        exit for
                    end if
                end for
            end if
            if services = invalid or services.Count() = 0 then hasService = true
            if hasService then filtered.Push(evt)
        end if
    end for

    displayEvents(filtered)
end sub

' ─── RENDERING ───

sub displayEvents(events as Object)
    m.eventsGroup.RemoveChildrenIndex(m.eventsGroup.GetChildCount(), 0)
    m.cardGrid = []

    if events.Count() = 0
        m.emptyLabel.visible = true
        return
    end if
    m.emptyLabel.visible = false

    if m.currentSport = "all"
        renderBySport(events)
    else
        renderFlat(events)
    end if

    m.eventsGroup.translation = [60, 0]
    m.scrollOffset = 0
    if m.focusMode = "cards" then updateCardFocus()
end sub

sub renderBySport(events as Object)
    sportOrder = ["nfl", "nba", "mlb", "nhl", "soccer", "college-football", "college-basketball", "mma", "golf", "tennis", "racing", "other"]
    sportLabels = {
        "nfl": "NFL", "nba": "NBA", "mlb": "MLB", "nhl": "NHL",
        "soccer": "Soccer", "college-football": "CFB",
        "college-basketball": "CBB", "mma": "MMA",
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

            sLbl = CreateObject("roSGNode", "Label")
            sLbl.text = label
            sLbl.font = "font:SmallBoldSystemFont"
            sLbl.color = "#FFFFFF"
            sLbl.translation = [0, yPos]
            m.eventsGroup.AppendChild(sLbl)
            yPos = yPos + 30

            rowCards = []
            xPos = 0
            cardCount = 0
            for each evt in sportEvents
                if cardCount >= 4 then exit for
                card = buildCard(evt, xPos, yPos)
                m.eventsGroup.AppendChild(card)
                rowCards.Push({ node: card, evt: evt })
                xPos = xPos + 280
                cardCount = cardCount + 1
            end for
            m.cardGrid.Push(rowCards)

            yPos = yPos + 195
        end if
    end for

    m.maxScroll = yPos - 500
    if m.maxScroll < 0 then m.maxScroll = 0
end sub

sub renderFlat(events as Object)
    yPos = 0
    xPos = 0
    cardCount = 0
    rowCards = []

    for each evt in events
        if cardCount > 0 and cardCount mod 4 = 0
            m.cardGrid.Push(rowCards)
            rowCards = []
            yPos = yPos + 195
            xPos = 0
        end if

        card = buildCard(evt, xPos, yPos)
        m.eventsGroup.AppendChild(card)
        rowCards.Push({ node: card, evt: evt })
        xPos = xPos + 280
        cardCount = cardCount + 1

        if cardCount >= 20 then exit for
    end for

    if rowCards.Count() > 0 then m.cardGrid.Push(rowCards)

    m.maxScroll = yPos + 195 - 500
    if m.maxScroll < 0 then m.maxScroll = 0
end sub

function buildCard(evt as Object, xPos as Integer, yPos as Integer) as Object
    cardW = 270
    cardH = 180

    card = CreateObject("roSGNode", "Rectangle")
    card.width = cardW
    card.height = cardH
    card.color = "#1A1F2E"
    card.translation = [xPos, yPos]

    status = "upcoming"
    if evt.HasField("status") and evt.status <> invalid and evt.status <> ""
        status = evt.status
    end if

    badge = CreateObject("roSGNode", "Rectangle")
    badge.translation = [10, 10]
    badge.height = 22
    badgeTxt = CreateObject("roSGNode", "Label")
    badgeTxt.translation = [6, 2]
    badgeTxt.font = "font:SmallestSystemFont"
    badgeTxt.color = "#FFFFFF"

    if status = "live"
        badge.color = "#FF3B30"
        badgeTxt.text = "LIVE"
        badge.width = 48
    else if status = "upcoming"
        badge.color = "#2D3548"
        timeStr = ""
        if evt.HasField("startTime") and evt.startTime <> invalid
            timeStr = FormatEventTime(evt.startTime)
        end if
        badgeTxt.text = timeStr
        badge.width = 78
    else
        badge.color = "#4A5568"
        badgeTxt.text = "FINAL"
        badge.width = 55
    end if
    badge.AppendChild(badgeTxt)
    card.AppendChild(badge)

    channel = ""
    if evt.HasField("channel") and evt.channel <> invalid then channel = evt.channel
    chLbl = CreateObject("roSGNode", "Label")
    chLbl.translation = [cardW - 90, 12]
    chLbl.width = 80
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
        hLbl.translation = [10, 42]
        hLbl.width = 200
        hLbl.font = "font:SmallBoldSystemFont"
        hLbl.color = "#FFFFFF"
        hLbl.maxLines = 1
        hLbl.text = homeTeam
        card.AppendChild(hLbl)

        aLbl = CreateObject("roSGNode", "Label")
        aLbl.translation = [10, 66]
        aLbl.width = 200
        aLbl.font = "font:SmallBoldSystemFont"
        aLbl.color = "#FFFFFF"
        aLbl.maxLines = 1
        aLbl.text = awayTeam
        card.AppendChild(aLbl)

        if status = "live" or status = "final"
            hs = ""
            as2 = ""
            if evt.HasField("homeScore") and evt.homeScore <> invalid then hs = evt.homeScore
            if evt.HasField("awayScore") and evt.awayScore <> invalid then as2 = evt.awayScore

            hsL = CreateObject("roSGNode", "Label")
            hsL.translation = [cardW - 45, 42]
            hsL.width = 35
            hsL.horizAlign = "right"
            hsL.font = "font:SmallBoldSystemFont"
            hsL.color = "#FFFFFF"
            hsL.text = hs
            card.AppendChild(hsL)

            asL = CreateObject("roSGNode", "Label")
            asL.translation = [cardW - 45, 66]
            asL.width = 35
            asL.horizAlign = "right"
            asL.font = "font:SmallBoldSystemFont"
            asL.color = "#FFFFFF"
            asL.text = as2
            card.AppendChild(asL)
        end if
    else
        tL = CreateObject("roSGNode", "Label")
        tL.translation = [10, 42]
        tL.width = cardW - 20
        tL.font = "font:SmallBoldSystemFont"
        tL.color = "#FFFFFF"
        tL.maxLines = 2
        tL.text = evtTitle
        card.AppendChild(tL)
    end if

    league = ""
    if evt.HasField("league") and evt.league <> invalid then league = evt.league
    lgL = CreateObject("roSGNode", "Label")
    lgL.translation = [10, 98]
    lgL.font = "font:SmallestSystemFont"
    lgL.color = "#8B95A5"
    lgL.text = UCase(league)
    card.AppendChild(lgL)

    svcY = 125
    svcX = 10
    if evt.HasField("availableServices") and evt.availableServices <> invalid
        badgeCount = 0
        for each svcId in evt.availableServices
            if badgeCount >= 3 then exit for
            svc = GetServiceById(svcId)
            if svc <> invalid
                shortName = svc.name
                if svc.DoesExist("short") then shortName = svc.short
                bw = 55

                svcBg = CreateObject("roSGNode", "Rectangle")
                svcBg.width = bw
                svcBg.height = 20
                svcBg.color = svc.color
                svcBg.translation = [svcX, svcY]

                svcLbl = CreateObject("roSGNode", "Label")
                svcLbl.text = shortName
                svcLbl.font = "font:SmallestSystemFont"
                svcLbl.color = "#FFFFFF"
                svcLbl.translation = [3, 1]
                svcLbl.width = bw - 6
                svcLbl.horizAlign = "center"
                svcBg.AppendChild(svcLbl)
                card.AppendChild(svcBg)

                svcX = svcX + bw + 5
                badgeCount = badgeCount + 1
            end if
        end for
    end if

    watchHint = CreateObject("roSGNode", "Label")
    watchHint.id = "watchHint"
    watchHint.translation = [10, cardH - 22]
    watchHint.font = "font:SmallestSystemFont"
    watchHint.color = "#30D158"
    watchHint.text = "Press OK to watch"
    watchHint.visible = false
    card.AppendChild(watchHint)

    return card
end function

' ─── CARD FOCUS ───

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
                if child.id = "watchHint"
                    child.visible = isFocused
                end if
            end for
        end for
    end for

    if m.cardGrid.Count() > 0 and m.focusRow < m.cardGrid.Count()
        row = m.cardGrid[m.focusRow]
        if m.focusCol < row.Count()
            cardInfo = row[m.focusCol]
            cardY = cardInfo.node.translation[1]
            visibleTop = m.scrollOffset
            visibleBottom = m.scrollOffset + 500

            if cardY < visibleTop
                m.scrollOffset = cardY - 30
                if m.scrollOffset < 0 then m.scrollOffset = 0
            else if cardY + 180 > visibleBottom
                m.scrollOffset = cardY + 180 - 500
            end if
            m.eventsGroup.translation = [60, -m.scrollOffset]
        end if
    end if
end sub

sub launchSelectedCard()
    if m.focusRow >= m.cardGrid.Count() then return
    row = m.cardGrid[m.focusRow]
    if m.focusCol >= row.Count() then return

    evt = row[m.focusCol].evt
    services = invalid
    if evt.HasField("availableServices") then services = evt.availableServices
    if services <> invalid and services.Count() > 0
        svcId = services[0]
        svc = GetServiceById(svcId)
        if svc <> invalid
            LaunchChannel(svc.rokuChannelId, "")
        end if
    end if
end sub

' ─── SETTINGS ───

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
        checkLbl.translation = [12, 10]
        checkLbl.font = "font:SmallSystemFont"
        checkLbl.color = "#30D158"
        if isSelected
            checkLbl.text = chr(10003)
        else
            checkLbl.text = " "
        end if

        nameLbl = CreateObject("roSGNode", "Label")
        nameLbl.translation = [40, 10]
        nameLbl.font = "font:SmallSystemFont"
        nameLbl.color = "#FFFFFF"
        nameLbl.text = svc.name

        colorDot = CreateObject("roSGNode", "Rectangle")
        colorDot.width = 8
        colorDot.height = 8
        colorDot.color = svc.color
        colorDot.translation = [480, 18]

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

' ─── TAB SWITCHING ───

sub showGuide()
    m.currentTab = 0
    m.guidePanel.visible = true
    m.settingsPanel.visible = false
    m.focusMode = "filter"
    m.sportFilter.SetFocus(true)
    filterAndDisplayEvents()
end sub

sub showSettings()
    m.currentTab = 1
    m.guidePanel.visible = false
    m.settingsPanel.visible = true
    m.settingsFocusIdx = 0
    updateSettingsFocus()
end sub

' ─── DEEP LINKING ───

function handleDeepLink(params as Object) as Boolean
    if params = invalid then return false
    if params.DoesExist("contentId")
        svc = GetServiceById(params.contentId)
        if svc <> invalid
            LaunchChannel(svc.rokuChannelId, "")
            return true
        end if
    end if
    return false
end function

' ─── KEY HANDLING ───

function OnKeyEvent(key as String, press as Boolean) as Boolean
    if not press then return false

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
        if key = "down"
            if m.cardGrid.Count() > 0
                m.focusMode = "cards"
                m.focusRow = 0
                m.focusCol = 0
                updateCardFocus()
            end if
            return true
        end if
        if key = "right"
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
                updateCardFocus()
                m.sportFilter.SetFocus(true)
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

        if key = "replay" or key = "play"
            m.loadingLabel.visible = true
            m.loadingLabel.text = "Refreshing..."
            m.emptyLabel.visible = false
            m.fetchTask.control = "run"
            return true
        end if

        if key = "back"
            m.focusMode = "filter"
            updateCardFocus()
            m.sportFilter.SetFocus(true)
            return true
        end if
    end if

    return false
end function

function handleSettingsKeys(key as String) as Boolean
    if key = "back" or key = "left"
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
