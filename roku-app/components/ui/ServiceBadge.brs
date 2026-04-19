sub Init()
    m.badgeBg = m.top.FindNode("badgeBg")
    m.badgeLabel = m.top.FindNode("badgeLabel")
end sub

sub onServiceChanged()
    m.badgeLabel.text = m.top.serviceName
    m.badgeBg.color = m.top.serviceColor
end sub
