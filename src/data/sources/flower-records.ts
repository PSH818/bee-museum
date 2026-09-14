import type { SourceRecord } from "../schemas/content";

// 花朵与四季馆的来源(M3)。全部由 AI 起草并给出参考来源,status 为 draft 表示尚无人工逐条核对。
const ACCESSED = "2026-08-26";
const wiki = (id: string, title: string, slug: string, lang = "en"): SourceRecord => ({
  id,
  title,
  organization: lang === "en" ? "Wikimedia Foundation" : `Wikimedia Foundation(${lang} 维基百科)`,
  url: `https://${lang}.wikipedia.org/wiki/${slug}`,
  accessedOn: ACCESSED,
  reviewer: null,
  status: "draft",
});
const rec = (id: string, title: string, organization: string, url: string): SourceRecord => ({
  id,
  title,
  organization,
  url,
  accessedOn: ACCESSED,
  reviewer: null,
  status: "draft",
});
const frps = (id: string, title: string, key: string): SourceRecord =>
  rec(id, `中国植物志:${title}`, "植物智 iplant.cn / 中国科学院植物研究所", `https://www.iplant.cn/ashx/getfrps.ashx?key=${key}`);

export const flowerSourceRecords: SourceRecord[] = [
  // ---- 油菜 ----
  wiki("src-wikipedia-rapeseed", "Rapeseed", "Rapeseed"),
  frps("src-frps-brassica-napus", "欧洲油菜 Brassica napus", "Brassica%20napus"),
  rec("src-honigmacher-raps", "Raps (Brassica napus) Pflanzensteckbrief", "Die Honigmacher(德国养蜂教学网站)", "https://www.die-honigmacher.de/kurs2/pflanze_8.html"),
  rec("src-harris-2024-osr-nectar", "Floral resource wastage: Most nectar produced by oilseed rape is not collected by insects (Ecology and Evolution, 2024)", "PMC / Wiley", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11106685/"),
  rec("src-zou-2017-osr-china", "Wild pollinators enhance oilseed rape yield in small-holder farms in China (BMC Ecology, 2017)", "PMC / BMC", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5320672/"),
  rec("src-westphal-2009-osr", "Mass flowering oilseed rape improves early colony growth but not sexual reproduction of bumblebees (Journal of Applied Ecology, 2009)", "Wiley", "https://doi.org/10.1111/j.1365-2664.2008.01580.x"),
  rec("src-liu-2017-cerana-osr", "Effects of Chinese honeybee foraging on oilseed rape gene flow and honey ingredients (Journal of Agricultural Science, 2017)", "Cambridge University Press", "https://www.cambridge.org/core/journals/journal-of-agricultural-science/article/abs/effects-of-chinese-honeybee-foraging-on-oilseed-rape-gene-flow-and-honey-ingredients/8036AF6224BB902330AFC1D3DDDBA31B"),
  // ---- 刺槐 ----
  wiki("src-wikipedia-black-locust", "Robinia pseudoacacia", "Robinia_pseudoacacia"),
  wiki("src-zhwiki-robinia", "刺槐(中文维基百科)", "%E5%88%BA%E6%A7%90", "zh"),
  frps("src-frps-robinia", "刺槐 Robinia pseudoacacia", "Robinia%20pseudoacacia"),
  wiki("src-dewiki-robinie", "Gewöhnliche Robinie(德文维基百科)", "Gew%C3%B6hnliche_Robinie", "de"),
  rec("src-usda-robinia", "Plant Guide: Black Locust (Robinia pseudoacacia)", "USDA NRCS", "https://plants.sc.egov.usda.gov/DocumentLibrary/plantguide/pdf/pg_rops.pdf"),
  rec("src-mo-2025-cerana-acacia-honey", "Chemical composition profiles of Apis cerana produced acacia (Robinia pseudoacacia) honey (European Food Research and Technology, 2025)", "Springer Nature", "https://link.springer.com/article/10.1007/s00217-025-04800-3"),
  wiki("src-wikipedia-monofloral-honey", "Monofloral honey", "Monofloral_honey"),
  // ---- 向日葵 ----
  wiki("src-wikipedia-sunflower", "Helianthus annuus", "Helianthus_annuus"),
  frps("src-frps-helianthus", "向日葵 Helianthus annuus", "Helianthus%20annuus"),
  wiki("src-dewiki-sonnenblume", "Sonnenblume(德文维基百科)", "Sonnenblume", "de"),
  rec("src-ncsu-sunflower", "Helianthus annuus — Plant Toolbox", "NC State Extension", "https://plants.ces.ncsu.edu/plants/helianthus-annuus/"),
  rec("src-raja-2025-sunflower", "Yield enhancement in sunflower through melittophily in tropical conditions (Indian Journal of Entomology, 2025)", "Entomological Society of India", "https://indianentomology.org/index.php/ije/article/download/3523/1957"),
  rec("src-greenleaf-2006-sunflower", "Wild bees enhance honey bees' pollination of hybrid sunflower (PNAS, 2006)", "PMC / PNAS", "https://pmc.ncbi.nlm.nih.gov/articles/PMC1564230/"),
  rec("src-ozbek-2013-xylocopa", "New Data on Large Carpenter-bees of Turkey with Considerations about Their Importance as Pollinators (J. Entomol. Res. Soc., 2013)", "Entomological Research Society", "https://www.entomol.org/journal/index.php/JERS/article/view/537"),
  rec("src-pmc-sunflower-nutrition", "A guide to sunflowers: floral resource nutrition for bee health (2025)", "PMC", "https://pmc.ncbi.nlm.nih.gov/articles/PMC12078318/"),
  // ---- 高丛蓝莓 ----
  wiki("src-wikipedia-highbush-blueberry", "Vaccinium corymbosum", "Vaccinium_corymbosum"),
  rec("src-usda-vaccinium", "Plant Guide: Highbush Blueberry (Vaccinium corymbosum)", "USDA NRCS", "https://plants.sc.egov.usda.gov/DocumentLibrary/plantguide/pdf/pg_vaco.pdf"),
  wiki("src-dewiki-kulturheidelbeere", "Kulturheidelbeere(德文维基百科)", "Kulturheidelbeere", "de"),
  rec("src-wildflower-vaco", "Vaccinium corymbosum (Highbush Blueberry)", "Lady Bird Johnson Wildflower Center", "https://www.wildflower.org/plants/result.php?id_plant=VACO"),
  rec("src-msu-blueberry-pollination", "Blueberries Require Pollination (Michigan Blueberry Pollination Factsheet)", "Michigan State University", "https://pollinators.msu.edu/_assets/files/resources/growers/MI-Blueberry-Pollination-Factsheet-FINAL.pdf"),
  rec("src-sun-2021-blueberry", "Differences in Pollination Efficiency Among Three Bee Species in a Greenhouse and Their Effects on Yield and Fruit Quality of Northern Highbush Blueberry (HortScience, 2021)", "American Society for Horticultural Science", "https://doi.org/10.21273/HORTSCI15714-21"),
  rec("src-sare-osmia-blueberry", "Evaluating hornfaced bees (Osmia cornifrons) as pollinators of highbush blueberry", "SARE / USDA", "https://projects.sare.org/project-reports/one05-049/"),
  rec("src-frontiers-2023-blueberry", "Pollination by native bees achieves high fruit quantity and quality of highbush blueberry (Frontiers in Sustainable Food Systems, 2023)", "Frontiers", "https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2023.1142623/full"),
  rec("src-cnhnb-blueberry", "蓝莓几月份开花?花期要做好哪些管理要点?(农技文章,非权威)", "惠农网 农技学堂", "https://www.cnhnb.com/xt/article-111533.html"),
  // ---- 白车轴草 ----
  wiki("src-wikipedia-white-clover", "Trifolium repens", "Trifolium_repens"),
  frps("src-frps-trifolium-repens", "白车轴草 Trifolium repens", "Trifolium%20repens"),
  rec("src-bsbi-white-clover", "Trifolium repens L., White Clover (Fermanagh species account)", "Botanical Society of Britain & Ireland", "https://bsbi.org/in-your-area/local-botany/co-fermanagh/fermanagh-species-accounts/trifolium-repens-l"),
  wiki("src-dewiki-weissklee", "Weißklee(德文维基百科)", "Wei%C3%9Fklee", "de"),
  rec("src-mnwild-white-clover", "White Clover (Trifolium repens)", "Minnesota Wildflowers", "https://www.minnesotawildflowers.info/flower/white-clover"),
  // ---- 薰衣草 ----
  wiki("src-wikipedia-lavandula-angustifolia", "Lavandula angustifolia", "Lavandula_angustifolia"),
  wiki("src-wikipedia-lavandula", "Lavandula", "Lavandula"),
  rec("src-foc-lavandula", "Flora of China: Lavandula angustifolia", "eFloras.org / Missouri Botanical Garden & Harvard University Herbaria", "http://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200019757"),
  rec("src-pfaf-lavandula", "Lavandula angustifolia", "Plants For A Future", "https://pfaf.org/user/Plant.aspx?LatinName=Lavandula+angustifolia"),
  rec("src-kozuharova-2022-lavender", "Pollinators of Lavandula angustifolia Mill., an important factor for optimal production of lavender essential oil (BioRisk, 2022)", "Pensoft", "https://biorisk.pensoft.net/article/77364/"),
  rec("src-sussex-lavender-2013", "Research shows bumblebees on lavender have it licked", "University of Sussex", "https://archive.sussex.ac.uk/broadcast/read/19067"),
  rec("src-balfour-2013-lavender", "Longer tongues and swifter handling: why do more bumble bees (Bombus spp.) than honey bees (Apis mellifera) forage on lavender? (Ecological Entomology, 2013)", "Wiley / Royal Entomological Society", "https://resjournals.onlinelibrary.wiley.com/doi/10.1111/een.12019"),
  rec("src-xj-weather-lavender-2023", "伊犁州气象局发布薰衣草花期预报(2023)", "中国天气网 / 伊犁州气象局", "https://xj.weather.com.cn/xjsy/tqyw/3624924.shtml"),
  rec("src-buzzaboutbees-xylocopa", "Violet Carpenter Bee - Xylocopa violacea(爱好者网站,低权威)", "BuzzAboutBees.net", "https://www.buzzaboutbees.net/violet-carpenter-bee.html"),
  // ---- 紫花苜蓿 ----
  wiki("src-wikipedia-alfalfa", "Alfalfa", "Alfalfa"),
  rec("src-foc-medicago", "Flora of China: Medicago sativa", "eFloras.org / Missouri Botanical Garden & Harvard University Herbaria", "http://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200012215"),
  rec("src-pfaf-medicago", "Medicago sativa", "Plants For A Future", "https://pfaf.org/user/Plant.aspx?LatinName=Medicago+sativa"),
  rec("src-mnwild-alfalfa", "Medicago sativa (Alfalfa)", "Minnesota Wildflowers", "https://www.minnesotawildflowers.info/flower/alfalfa"),
  rec("src-mcgregor-1976-alfalfa", "Insect Pollination of Cultivated Crop Plants: Alfalfa (McGregor, 1976)", "USDA Agricultural Research Service", "https://www.apiservices.biz/htm/pollination_handbook/chap_10000000002822327.html"),
  rec("src-ifas-megachile", "Alfalfa Leaf-Cutter Bee Megachile rotundata (EENY-820)", "University of Florida IFAS Extension", "https://ask.ifas.ufl.edu/publication/IN1452"),
  // ---- 第 23 轮审查后补充 ----
  wiki("src-dewiki-raps", "Raps(德文维基百科)", "Raps", "de"),
  wiki("src-wikipedia-clover", "Clover", "Clover"),
  rec("src-gobotany-vaco", "Vaccinium corymbosum — highbush blueberry", "Go Botany / Native Plant Trust", "https://gobotany.nativeplanttrust.org/species/vaccinium/corymbosum/"),
  rec("src-nz-2018-clover-bombus", "Bombus terrestris: a more efficient but less effective pollinator than Apis mellifera across surveyed white clover seed fields (New Zealand Journal of Crop and Horticultural Science, 2018)", "Taylor & Francis", "https://doi.org/10.1080/01140671.2018.1466341"),
  rec("src-ncsu-lavandula", "Lavandula angustifolia (Common Lavender)", "NC State Extension", "https://plants.ces.ncsu.edu/plants/lavandula-angustifolia/"),
  // ---- 地域 ----
  wiki("src-wikipedia-season", "Season", "Season"),
  wiki("src-wikipedia-temperate-climate", "Temperate climate", "Temperate_climate"),
  wiki("src-wikipedia-humid-continental", "Humid continental climate", "Humid_continental_climate"),
  wiki("src-wikipedia-climate-of-china", "Climate of China", "Climate_of_China"),
  wiki("src-wikipedia-geography-of-beijing", "Geography of Beijing", "Geography_of_Beijing"),
  wiki("src-wikipedia-shanghai", "Shanghai", "Shanghai"),
  wiki("src-wikipedia-europe", "Europe", "Europe"),
  wiki("src-wikipedia-geography-of-germany", "Geography of Germany", "Geography_of_Germany"),
  wiki("src-wikipedia-climate-of-us", "Climate of the United States", "Climate_of_the_United_States"),
];
