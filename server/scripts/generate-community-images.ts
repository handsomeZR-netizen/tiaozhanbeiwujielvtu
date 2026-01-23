import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 鐩存帴璁剧疆鐜鍙橀噺
const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
if (!ARK_API_KEY) {
  console.error('Missing ARK_API_KEY environment variable');
  process.exit(1);
}

// 鍥剧墖鐢熸垚鎻愮ず璇嶉厤缃紙浣跨敤涓枃 + 澶氭枃鍖栦氦铻嶅厓绱狅級
const imagePrompts = [
  {
    id: 'post-01',
    filename: 'post-01-nanjing-suiyuan.jpg',
    prompt: '鍗椾含甯堣寖澶у闅忓洯鏍″尯锛屾皯鍥芥椂鏈熺孩鐮栧缓绛戯紝鎷卞舰绐楁埛鍜岀綏椹煴锛屾ⅶ妗愭爲鎶曚笅鏂戦┏鏍戝奖锛屽鍥界暀瀛︾敓鍜屼腑鍥藉鐢熷湪鏍″洯灏忚矾涓婁氦娴佽璁猴紝娓╂殩鐨勪笅鍗堥槼鍏夛紝澶氬厓鏂囧寲鏍″洯姘涘洿锛岀邯瀹炴憚褰遍鏍硷紝4K瓒呴珮娓呯敾璐紝鏂囧寲閬椾骇缇庡锛屽鍙よ壊璋冿紝鐢靛奖鏋勫浘锛屽弸濂界殑璺ㄦ枃鍖栦氦娴?
  },
  {
    id: 'post-02',
    filename: 'post-02-nanjing-xuanwu.jpg',
    prompt: '鍗椾含鐜勬婀栨竻鏅ㄦ櫙鑹诧紝钖勯浘绗肩僵婀栭潰锛岃繙澶勭传閲戝北杞粨锛屽鍥芥父瀹㈠拰鏈湴浜轰竴璧峰湪婀栬竟鎵撳お鏋佹嫵锛岄獞琛岃€呭湪鐜箹閬撹矾涓婏紝娓╂煍鐨勬櫒鍏夛紝瀹侀潤绁ュ拰鐨勬皼鍥达紝澶氭枃鍖栧拰璋愬叡澶勶紝椋庡厜鎽勫奖椋庢牸锛?K瓒呴珮娓呰川閲忥紝鑷劧鍏夌嚎锛岃摑璋冭壊褰╋紝鐢靛奖绾ф瀯鍥?
  },
  {
    id: 'post-03',
    filename: 'post-03-nanjing-jiming.jpg',
    prompt: '鍗椾含楦￠福瀵烘ū鑺辩洓寮€锛屽彜瀵洪粍鑹插洿澧欙紝绮夌櫧鑹叉ū鑺辨爲锛岃姳鐡ｉ钀斤紝澶栧浗娓稿鍜屼腑鍥芥父瀹㈠湪妯辫姳鏍戜笅鑷媿鍚堝奖锛屾俯鏆栫殑鏄ユ棩闃冲厜锛屾氮婕敮缇庣殑姘涘洿锛屽鍏冩枃鍖栦氦娴侊紝椋庡厜鎽勫奖锛?K瓒呴珮娓呯敾璐紝鏌斿拰鍏夌嚎锛岀矇鑹茶皟锛岀數褰辨劅鏋勫浘'
  },
  {
    id: 'post-04',
    filename: 'post-04-nanjing-zhongshan.jpg',
    prompt: '鍗椾含涓北闄靛叏鏅紝瀹忎紵鐨勭煶闃朵粠灞辫剼寤朵几鍒扮キ鍫傦紝钃濊壊鐞夌拑鐡﹀眿椤讹紝涓や晶鏉炬煆鏋楃珛锛屼笉鍚屽浗绫嶇殑娓稿鍦ㄥ彴闃朵笂鏀€鐧讳氦娴侊紝搴勪弗鑲冪﹩鐨勬皼鍥达紝鍥介檯鏂囧寲浜ゆ祦锛屽缓绛戞憚褰遍鏍硷紝4K瓒呴珮娓呰川閲忥紝瀵圭О鏋勫浘锛岃嚜鐒跺厜绾匡紝钃濈豢鑹茶皟'
  },
  {
    id: 'post-05',
    filename: 'post-05-nanjing-sycamore.jpg',
    prompt: '鍗椾含姊ф澶ч亾锛岄珮澶х殑娉曞浗姊ф鏍戝舰鎴愮豢鑹查毀閬擄紝闃冲厜閫忚繃鏍戝彾娲掍笅鏂戦┏鍏夊奖锛屽鍥芥父瀹㈠拰鏈湴浜轰竴璧烽獞鍏变韩鍗曡溅锛屽巻鍙插缓绛戝湪鏍戞湪闂磋嫢闅愯嫢鐜帮紝瀹侀潤鐨勫煄甯傚満鏅紝澶氭枃鍖栧拰璋愭皼鍥达紝绾疄鎽勫奖椋庢牸锛?K瓒呴珮娓呯敾璐紝娓╂殩鑹茶皟锛屾€€鏃ф皼鍥达紝鐢靛奖鏋勫浘'
  },
  {
    id: 'post-06',
    filename: 'post-06-beijing-hutong.jpg',
    prompt: '鍖椾含浼犵粺鑳″悓灏忓贩锛屾俯鏆栫殑鍗堝悗闃冲厜锛屽彜鑰佺殑鐏扮爾澧欎笂鐖弧钘よ敁锛屽鍥芥父瀹㈠拰鑰佸寳浜汉鍧愬湪绾㈤棬鍓嶇殑鏈ㄥ嚦涓婅亰澶╋紝鐚湪鐭抽樁涓婃墦鐩癸紝鍦伴潰涓婃枒椹崇殑鍏夊奖锛屽畞闈欑ゥ鍜岀殑姘涘洿锛岃法鏂囧寲鍙嬪ソ浜ゆ祦锛岀邯瀹炴憚褰遍鏍硷紝4K瓒呴珮娓呯敾璐紝鐢靛奖鏋勫浘锛屾枃鍖栭仐浜х編瀛︼紝娓╂殩鑹茶皟'
  },
  {
    id: 'post-07',
    filename: 'post-07-hangzhou-hefang.jpg',
    prompt: '鏉窞娌冲潑琛楁竻鏅ㄦ櫙璞★紝浼犵粺涓紡鏈ㄨ川搴楅摵涓€瀹跺鎵撳紑锛屾俯鏆栫殑閲戣壊鏃ュ嚭鍏夌嚎锛屽鍥芥父瀹㈠拰搴椾富鍙嬪ソ浜ゆ祦锛屾棭椁愭憡浣嶅崌璧风儹姘旓紝绌烘皵涓鏁ｆ鑺遍锛屼紶缁熷缓绛戞寕鐫€绾㈢伅绗硷紝瀹侀潤鐨勯粠鏄庢皼鍥达紝澶氬厓鏂囧寲浜掑姩锛岀邯瀹炴憚褰遍鏍硷紝4K瓒呴珮娓呯敾璐紝鏂囧寲鐪熷疄鎰燂紝鏌斿拰鐨勬櫒鍏?
  },
  {
    id: 'post-08',
    filename: 'post-08-chengdu-teahouse.jpg',
    prompt: '鎴愰兘浜烘皯鍏洯浼犵粺鑼堕锛岀妞呭拰灏忚尪妗岋紝澶栧浗娓稿鍜屾湰鍦颁汉涓€璧锋墦楹诲皢鑱婂ぉ鍠濊尪锛岃儗鏅湁鎺忚€虫湹鏈嶅姟锛屾爲鑽笅鏂戦┏鐨勯槼鍏夛紝鍐掔潃鐑皵鐨勮尪鏉紝杞绘澗鎯剰鐨勬皼鍥达紝澶氭枃鍖栬瀺鍚堝満鏅紝绾疄鎽勫奖椋庢牸锛?K瓒呴珮娓呯敾璐紝鐪熷疄鐨勬枃鍖栧満鏅紝娓╂殩鐨勫崍鍚庡厜绾匡紝鐢熸椿鏂瑰紡鎽勫奖缇庡'
  },
  {
    id: 'post-09',
    filename: 'post-09-suzhou-embroidery.jpg',
    prompt: '鑻忓窞鍒虹唬宸ュ潑锛屽鍥藉鐢熷拰涓浗甯堝倕涓€璧峰埡缁ｏ紝鍙屾墜姝ｅ湪鍒虹唬锛岀簿鑷寸殑褰╄壊涓濈嚎锛屼紶缁熸湪璐ㄧ唬鏋讹紝閮ㄥ垎瀹屾垚鐨勮姳鍗夊浘妗堬紝绐楁埛閫忚繘鏌斿拰鐨勮嚜鐒跺厜锛屼紶缁熶腑寮忓伐鍧婂唴鏅紝璺ㄦ枃鍖栨妧鑹轰紶鎵匡紝鏂囧寲閬椾骇宸ヨ壓锛?K寰窛鎽勫奖锛屼紭闆呮瀯鍥撅紝绾疄椋庢牸锛屾俯鏆栫殑鐜鍏?
  },
  {
    id: 'post-10',
    filename: 'post-10-jingdezhen-pottery.jpg',
    prompt: '鏅痉闀囬櫠鐡峰伐鍧婏紝澶栧浗娓稿鍜屼腑鍥介櫠鑹哄笀涓€璧峰湪鏃嬭浆鐨勬媺鍧満涓婂褰紝婀挎鼎鐨勯櫠鍦熷崌璧锋垚纰楃姸锛屾按鐝犲弽灏勫厜绾匡紝浼犵粺闄剁摲宸ヤ綔瀹よ揣鏋朵笂鎽嗘弧闄剁摲锛屾俯鏆栫殑宸ュ潑鐓ф槑锛屽伐鍖犱笓娉ㄧ殑绁炴儏锛屽鏂囧寲鎵嬪伐鑹轰綋楠岋紝鏂囧寲宸ヨ壓锛?K瓒呴珮娓呯敾璐紝绾疄鎽勫奖椋庢牸锛岀湡瀹炵殑宸ュ潑姘涘洿锛屽ぇ鍦拌壊璋?
  },
  {
    id: 'post-11',
    filename: 'post-11-xian-night-market.jpg',
    prompt: '瑗垮畨鍥炴皯琛楀甯傜儹闂瑰満鏅紝绾㈢伅绗肩収浜杈瑰皬鍚冩憡锛岀緤鑲夋场棣嶆憡浣嶅崌璧风儹姘旓紝澶栧浗娓稿鍜屾湰鍦颁汉涓€璧蜂韩鍙楄澶寸編椋熶氦娴侊紝鑳屾櫙鏄紶缁熶紛鏂叞寤虹瓚锛屾俯鏆栫殑閲戣壊鐏厜锛屽厖婊℃椿鍔涚殑澶滄櫄姘涘洿锛屽鍏冩枃鍖栫編椋熶綋楠岋紝琛楀ご鎽勫奖椋庢牸锛?K瓒呴珮娓呯敾璐紝鏂囧寲澶氭牱鎬э紝鐢靛奖鎰熷鏅紝鐪熷疄鐨勫煄甯傜敓娲?
  },
  {
    id: 'post-12',
    filename: 'post-12-shanghai-bund.jpg',
    prompt: '涓婃捣澶栨哗澶滄櫙锛屼竴渚ф槸娆у紡鍘嗗彶寤虹瓚鐨勬俯鏆栧彜鍏哥伅鍏夛紝榛勬郸姹熷宀告槸闄嗗鍢寸幇浠ｆ懇澶╁ぇ妤肩殑闇撹櫣鐏紝姘撮潰鍊掑奖锛屽鍥芥父瀹㈠拰涓浗娓稿鍦ㄦ花姹熸閬撲笂鑷媿鍚堝奖锛屾垙鍓ф€х殑鍩庡競鏅锛屽浗闄呭寲閮藉競姘涘洿锛?K瓒呴珮娓呯敾璐紝寤虹瓚鎽勫奖锛岀數褰辨瀯鍥撅紝钃濊皟鏃跺埢姘涘洿锛屾枃鍖栧姣旂編瀛?
  },
  {
    id: 'post-13',
    filename: 'post-13-guangzhou-dimsum.jpg',
    prompt: '骞垮窞浼犵粺鏃╄尪鍦烘櫙锛屽渾妗屼笂鎽嗘斁绔瑰埗钂哥鐐瑰績锛屽鍥芥父瀹㈠拰鏈湴鑰佷汉杈瑰枬鑼惰竟鑱婂ぉ浜ゆ祦锛岃尪澹跺拰灏忚尪鏉紝绐楁埛閫忚繘鑷劧鏅ㄥ厜锛屾瀹楃菠寮忚尪妤煎唴鏅紝铏鹃ズ鍜岀儳鍗栫壒鍐欙紝璺ㄦ枃鍖栫敤椁愪綋楠岋紝4K鎽勫奖鐢昏川锛屾俯鏆栨皼鍥达紝绾疄椋庢牸锛岀敓娲荤編瀛?
  },
  {
    id: 'post-14',
    filename: 'post-14-chongqing-hotpot.jpg',
    prompt: '閲嶅簡鐏攨鍦烘櫙锛岄赋楦攨涓孩娌圭炕婊氾紝绛峰瓙澶硅捣椋熸潗锛屽鍥芥湅鍙嬪拰涓浗鏈嬪弸鍥村潗妗屾梺涓€璧锋懂鐏攨锛岀儹姘斿崌鑵撅紝浼犵粺鐏攨搴楁皼鍥达紝椴滆壋鐨勭孩鑹茶皟锛屽鏂囧寲缇庨鍒嗕韩锛岀編椋熸憚褰遍鏍硷紝4K瓒呴珮娓呯敾璐紝鏂囧寲鐢ㄩ浣撻獙锛屾俯鏆栫殑绀句氦姘涘洿锛屾瀹楀窛鑿滅編瀛?
  },
  {
    id: 'post-15',
    filename: 'post-15-beijing-park.jpg',
    prompt: '鍖椾含鍏洯娓呮櫒鍦烘櫙锛屽鍥芥父瀹㈠拰涓浗鑰佸勾浜轰竴璧风粌涔犲お鏋佹嫵锛屽叾浠栦汉璺冲箍鍦鸿垶锛岃儗鏅槸浼犵粺涓紡寤虹瓚锛屾櫒闆惧拰鏌斿拰鐨勯噾鑹查槼鍏夛紝瀹侀潤绁ュ拰鐨勬皼鍥达紝澶氭枃鍖栧仴韬氦娴侊紝绾疄鎽勫奖锛?K瓒呴珮娓呯敾璐紝鏂囧寲鐢熸椿鏂瑰紡锛岀湡瀹炵殑鍩庡競鐢熸椿锛屾俯鏆栫殑榛庢槑鍏夌嚎锛岀ぞ鍖烘椿鍔?
  },
  {
    id: 'post-16',
    filename: 'post-16-shanghai-jianbing.jpg',
    prompt: '涓婃捣琛楀ご缇庨鍦烘櫙锛屽弸濂界殑鎽婁富鍚戝鍥芥父瀹㈠睍绀虹Щ鍔ㄦ敮浠樹簩缁寸爜骞舵暀瀛︼紝鐓庨ゼ鏋滃瓙鍦ㄩ搧鏉夸笂鍒朵綔锛屾棭鏅ㄨ澶存皼鍥达紝鎵嬫満鎵爜鏀粯锛屾俯鏆栫殑璺ㄦ枃鍖栦簰鍔紝鍙嬪ソ浜ゆ祦锛岀邯瀹炴憚褰憋紝4K瓒呴珮娓呯敾璐紝鐪熷疄鐨勫煄甯傜敓娲伙紝鏂囧寲浜ゆ祦鏃跺埢锛岃嚜鐒舵櫒鍏?
  }
];

// 鐢熸垚鍥剧墖锛堜娇鐢?seedream API锛屾棤姘村嵃锛?
async function generateImage(prompt: string, size: string = '2K') {
  const response = await fetch(`${ARK_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ARK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt,
      response_format: 'url',
      size,
      watermark: false, // 鍏抽敭锛氭棤姘村嵃
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// 涓嬭浇鍥剧墖
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fsSync.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err: Error) => {
        fsSync.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

// 鐢熸垚鍗曞紶鍥剧墖
async function generateSingleImage(config: typeof imagePrompts[0], outputDir: string) {
  console.log(`\n馃帹 鐢熸垚鍥剧墖: ${config.id}`);
  console.log(`馃摑 鎻愮ず璇? ${config.prompt.substring(0, 60)}...`);

  try {
    // 璋冪敤璞嗗寘 seedream API 鐢熸垚鍥剧墖锛堟棤姘村嵃锛?
    const result = await generateImage(config.prompt, '2K');
    
    if (!result.data || !result.data[0] || !result.data[0].url) {
      throw new Error('API 杩斿洖鏁版嵁鏍煎紡閿欒');
    }

    const imageUrl = result.data[0].url;
    console.log(`鉁?鍥剧墖鐢熸垚鎴愬姛: ${imageUrl.substring(0, 80)}...`);

    // 涓嬭浇鍥剧墖
    const filepath = path.join(outputDir, config.filename);
    await downloadImage(imageUrl, filepath);
    console.log(`馃捑 鍥剧墖宸蹭繚瀛? ${filepath}`);

    return {
      id: config.id,
      filename: config.filename,
      url: imageUrl,
      success: true
    };
  } catch (error) {
    console.error(`鉂?鐢熸垚澶辫触: ${error}`);
    return {
      id: config.id,
      filename: config.filename,
      error: error instanceof Error ? error.message : String(error),
      success: false
    };
  }
}

// 鍒犻櫎鏃у浘鐗?
async function cleanOldImages(outputDir: string) {
  try {
    const files = await fs.readdir(outputDir);
    const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    
    if (imageFiles.length > 0) {
      console.log(`\n馃棏锔? 鍒犻櫎 ${imageFiles.length} 寮犳棫鍥剧墖...`);
      for (const file of imageFiles) {
        await fs.unlink(path.join(outputDir, file));
        console.log(`   鉁?宸插垹闄? ${file}`);
      }
    }
  } catch (error) {
    // 鐩綍涓嶅瓨鍦ㄦ垨涓虹┖锛屽拷鐣ラ敊璇?
  }
}

// 涓诲嚱鏁?
async function main() {
  console.log('馃殌 寮€濮嬬敓鎴愮ぞ鍖哄笘瀛愬浘鐗?..');
  console.log('馃搶 浣跨敤 doubao-seedream API + 涓枃鎻愮ず璇?+ 鏃犳按鍗?);
  console.log('馃實 娣诲姞澶氭枃鍖栦氦铻嶅厓绱燶n');

  // 鍒涘缓杈撳嚭鐩綍
  const outputDir = path.join(__dirname, '../testimages/community-posts');
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`馃搧 杈撳嚭鐩綍: ${outputDir}`);

  // 鍒犻櫎鏃у浘鐗?
  await cleanOldImages(outputDir);

  // 鐢熸垚璁板綍
  const results = [];

  // 閫愪釜鐢熸垚鍥剧墖锛堥伩鍏嶅苟鍙戣繃澶氾級
  for (const config of imagePrompts) {
    const result = await generateSingleImage(config, outputDir);
    results.push(result);

    // 绛夊緟 3 绉掞紝閬垮厤 API 闄愭祦
    if (imagePrompts.indexOf(config) < imagePrompts.length - 1) {
      console.log('鈴?绛夊緟 3 绉?..');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 淇濆瓨鐢熸垚璁板綍
  const recordPath = path.join(outputDir, 'generation-record.json');
  await fs.writeFile(
    recordPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      model: 'doubao-seedream-4-5-251128',
      size: '2K',
      watermark: false,
      features: ['澶氭枃鍖栦氦铻?, '璺ㄦ枃鍖栦氦娴?, '鍥介檯鍙嬪ソ'],
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }, null, 2)
  );

  // 杈撳嚭缁熻
  console.log('\n\n馃搳 鐢熸垚缁熻:');
  console.log(`鉁?鎴愬姛: ${results.filter(r => r.success).length}`);
  console.log(`鉂?澶辫触: ${results.filter(r => !r.success).length}`);
  console.log(`馃搫 璁板綍鏂囦欢: ${recordPath}`);

  // 杈撳嚭澶辫触鍒楄〃
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n鉂?澶辫触鍒楄〃:');
    failed.forEach(f => {
      console.log(`  - ${f.id}: ${f.error}`);
    });
  }

  console.log('\n鉁?瀹屾垚锛佹墍鏈夊浘鐗囧潎涓烘棤姘村嵃鐗堟湰锛屽寘鍚鏂囧寲浜よ瀺鍏冪礌銆?);
}

// 鎵ц
main().catch(console.error);
