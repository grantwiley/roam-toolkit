import {Browser} from '../utils/browser'
import {addDays, isValid, RoamDate} from '../date/common'
import {RoamDb} from './roam-db'

export const Navigation = {
    baseUrl: () => {
        // https://roamresearch.com/#/app/roam-toolkit/page/03-24-2020
        const url = Browser.getActiveTabUrl()
        const parts = url.hash.split('/')

        url.hash = parts.slice(0, 3).concat(['page']).join('/')
        return url
    },

    currentPageUid() {
        const parts = Browser.getActiveTabUrl().hash.split('/')
        return parts[parts.length - 1]
    },

    async goToPageWithName(name: string) {
        const datePage = RoamDb.getPageByName(name)
        if (!datePage) return
        return Browser.goToPage(this.baseUrl().toString() + '/' + datePage[':block/uid'])
    },

    async goToDatePage(date: Date) {
        return this.goToPageWithName(RoamDate.format(date))
    },

    async goToTodayPage() {
        return this.goToDatePage(navigationDate(new Date()))
    },

    async goToRelativeDayPage(days: number) {
        return this.goToDatePage(addDays(getCurrentPageDate(), days))
    },

    async goToNextDayPage() {
        return this.goToRelativeDayPage(1)
    },

    async goToPreviousDayPage() {
        return this.goToRelativeDayPage(-1)
    },
}

function getCurrentPageDate(): Date {
    const currentPage = RoamDb.getBlockByUid(Navigation.currentPageUid())
    const title = currentPage[':node/title']
    const date = RoamDate.parse(title)

    if (!isValid(date)) {
        console.log(`Can't parse error from "${title}". Using current date`)
        return new Date()
    }
    return date
}

function navigationDate(date: Date) {
    // Tomorrow starts at 2am for the purposes of this
    const copy = new Date(date)
    copy.setHours(copy.getHours() - 2)
    return copy
}
