import { request } from './util.js'
import { map_song_list } from "./util.js"

import { Client } from "@notionhq/client"

export const get_playlist = async (id) => {
    // const notion = new Client({ auth: process.env.NOTION_TOKEN })
    const notion = new Client({ auth: "secret_xvMkQzLkCRtZL478L8MhvLdIDOxicjjSUm9U9voAwbb"})
    let res = []
    let has_more = true
    let start_cursor = undefined
    const queryRes = await notion.databases.query({
        database_id: id,
        start_cursor: start_cursor,
        page_size: 100,
    })
    console.log(`queryRes = ${queryRes}`)
    for (const page of queryRes.results) {
        const properties = page.properties
        res.push({
            title: properties?.歌曲?.title?.[0]?.plain_text || '',
            url: properties?.音频?.files?.[0]?.file?.url || '',
            lrc: properties?.歌词?.files?.[0]?.file?.url || '',
            pic: page.cover?.external?.url || page.cover?.file?.url || '',
            author: properties?.Artist?.formula?.string || ''
        })
    }

    has_more = queryRes.has_more
    start_cursor = queryRes.next_cursor
    return res
}

// const res = await get_playlist(2787254569)
// console.log(res)

