import { request } from "./util.js"
import { map_song_list } from "./util.js"
import { Client } from "@notionhq/client"

export const get_song_url = async (id, cookie = '') => {

    const data = {
        ids: '[' + id + ']',
        level: 'standard',
        encodeType: 'flac',
    }

    let res = {}

    try {
        res = await request(
            'POST',
            `https://interface.music.163.com/eapi/song/enhance/player/url/v1`,
            data,
            {
                crypto: 'eapi',
                url: '/api/song/enhance/player/url/v1',
                cookie: {}
            },
        )
    } catch (e) {
        console.error(e)
    }

    const url = res.data && res.data[0]?.url?.replace('http://', 'https://')
    return url || `https://music.163.com/song/media/outer/url?id=${id}.mp3`

}

export const get_song_info = async (id, cookie = '') => {

    // 初始化Notion sdk
    const notion = new Client({ auth: process.env.NOTION_TOKEN })
    console.log(`token = ${process.env.NOTION_TOKEN }`)
    let res = []
    try {
        const page = await notion.pages.retrieve({ page_id: id })
        // 这里假设Notion页面属性中有音乐相关信息
        // 你可以根据实际Notion数据库结构调整字段
        const properties = page.properties
        const relation = properties?.歌手?.relation || [];
        let author = '';
        if (relation.length > 0) {
            // 遍历relation，根据id获取关联的page
            const authorNames = [];
            for (const rel of relation) {
                try {
                    const artistPage = await notion.pages.retrieve({ page_id: rel.id });
                    // 假设歌手页面有“姓名”属性
                    const artistName = artistPage.properties?.标题?.title?.[0]?.plain_text || '';
                    if (artistName) authorNames.push(artistName);
                } catch (e) {
                    console.error(`获取歌手页面失败: ${rel.id}`, e);
                }
            }
            author = authorNames.join('&');
        }
        res = [{
            title: properties?.歌曲?.title?.[0]?.plain_text || '',
            url: properties?.音频?.files?.[0]?.file?.url || '', // 音频为文件类型
            lrc: page.properties?.歌词?.files?.[0]?.file?.url || '', // lrc属性名为格式，也是文件类型
            pic: page.cover?.external?.url || page.cover?.file?.url || '', // 获取页面封面作为pic
            author:author
        }]
    } catch (e) {
        console.error(e)
    }
    return res
}
// const res = await get_song_info('1874976923');
// const res = await get_song_url('1874976923');
// console.log(res)
