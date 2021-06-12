let musicVideos = await fetchMusicVideos()

if (config.runsInWidget) {
    let widget = await getWidget(musicVideos)
    new Notification()
    Script.setWidget(widget)
} else if (config.runsInApp) {
    let table = await getTable(musicVideos)
    QuickLook.present(table, false)
}

Script.complete()

async function fetchMusicVideos() {
    let url = "https://www.reddit.com/r/kpop/search/.json?q=flair_name%3A%22%5BMV%5D%22&restrict_sr=true&t=day&sort=hot"
    
    let request = new Request(url)
    let json = await request.loadJSON()

    let musicVideos = json.data.children
        .map(mv => ({ 
            title: mv.data.title, 
            thumbnail: mv.data.thumbnail,
            url: mv.data.url,
        }))

   return musicVideos
}

async function getTable(musicVideos) {    
    let table = new UITable()

    for (let video of musicVideos) {
        let row = new UITableRow()
        
        let imageCell = row.addImageAtURL(video.thumbnail)
        imageCell.widthWeight = 20

        row.spacing = 10
        row.height = 62

        let title = getArtistName(video.title)
        let subtitle = getSubtitle(video.title)

        let label = row.addText(title, subtitle)
        label.widthWeight = 80
        label.textColor = Color.dynamic(new Color("#121212"), Color.white())
        label.subtitleColor = Color.lightGray()
        
        row.onSelect = () => {
            presentAlert(video)
        }

        row.dismissOnSelect = false
        table.title = ""
        table.dismissOnSelect = false
        table.showSeparators = false
        table.addRow(row)
    }
    return table
}

async function getWidget(musicVideos) {
    let widget = new ListWidget()

    let title = widget.addText("K-Pop MV 💗")
    title.font = Font.boldRoundedSystemFont(16)
    title.leftAlignText()
    title.textColor = new Color("#F652A0")

    widget.addSpacer(5)
    
    for (let video of musicVideos.slice(0, 7)) {
        let title = widget.addText(getArtistName(video.title))
        title.textColor = Color.dynamic(new Color("#121212"), Color.white())
        title.lineLimit = 1
        title.centerAlignText()
        title.font = Font.boldRoundedSystemFont(12)
    }
    
    widget.addSpacer(5)

    widget.backgroundColor = Color.dynamic(Color.white(), new Color("#1c1c1eff"))
    return widget
}

function getArtistName(title){
    return title.split(/[" " - " "]/)[0];
}

function getSubtitle(title){
    return title.split(" - ").pop()
}

async function presentAlert(video){
    let alert = new Alert()
    alert.addAction("Watch ")
    alert.addAction("Share 💌")
    alert.addCancelAction("Cancel")
    let index = await alert.presentSheet()
    if (index == 0) {
        Safari.open(video.url)
    } else if (index == 1) {
        let item = (video.title) + "\n" + (video.url)
        ShareSheet.present([item])
    } else {
        return 
    }
}