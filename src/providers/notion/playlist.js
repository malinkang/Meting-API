import { request } from './util.js'
import { map_song_list } from "./util.js"

import { Client } from "@notionhq/client"

export const get_playlist = async (id) => {
    const notion = new Client({ auth: process.env.NOTION_TOKEN })
    let res = []
    let has_more = true
    let start_cursor = undefined
    const queryRes = await notion.databases.query({
        database_id: id,
        start_cursor: start_cursor,
        page_size: 100,
    })

    for (const page of queryRes.results) {
        const properties = page.properties
        // 处理歌手relation
        const relation = properties?.歌手?.relation || [];
        let author = '';
        if (relation.length > 0) {
            const authorNames = [];
            for (const rel of relation) {
                try {
                    const artistPage = await notion.pages.retrieve({ page_id: rel.id });
                    const artistName = artistPage.properties?.标题?.title?.[0]?.plain_text || '';
                    if (artistName) authorNames.push(artistName);
                } catch (e) {
                    console.error(`获取歌手页面失败: ${rel.id}`, e);
                }
            }
            author = authorNames.join('&');
        }
        res.push({
            title: properties?.歌曲?.title?.[0]?.plain_text || '',
            url: properties?.音频?.files?.[0]?.file?.url || '',
            lrc: properties?.歌词?.files?.[0]?.file?.url || '',
            pic: page.cover?.external?.url || page.cover?.file?.url || '',
            author: author
        })
    }

    has_more = queryRes.has_more
    start_cursor = queryRes.next_cursor
    return res
}

// const res = await get_playlist(2787254569)
// console.log(res)

