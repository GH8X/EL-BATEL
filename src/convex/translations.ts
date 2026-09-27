import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Editorial translations for the EL BATEL catalogue.
 *
 * One product row carries every language — `name` is English, `name_fr` and
 * `name_ar` hold the translations. Serial numbers, prices, slugs, images and
 * IDs are never touched by this file.
 *
 * `seedTranslations` patches an already-seeded store; `seed.seedAll` writes the
 * same values when a store is built from scratch, so both paths end identical.
 */

type Localised = { fr: string; ar: string };

export const PRODUCT_TRANSLATIONS: Record<
  string,
  { name: Localised; description: Localised; story?: Localised; material?: Localised; color?: Localised; care?: Localised }
> = {
  "el-batel-black-edition": {
    name: { fr: "EL BATEL — ÉDITION NOIRE", ar: "EL BATEL — الإصدار الأسود" },
    description: {
      fr: "La pièce autour de laquelle toute l'archive est construite. Molleton noir épais, silhouette boxy, broderie tonale sur la poitrine et numéro d'édition imprimé à l'intérieur de la patte. Cent pièces existent et la série est close dès que le dernier numéro quitte le studio.",
      ar: "القطعة التي بُني حولها الأرشيف كله. قطن ثقيل باللون الأسود، قَصّة واسعة، تطريز بلون واحد على الصدر، ورقم الإصدار مطبوع داخل الفتحة. مئة قطعة فقط، ويُغلق الإصدار نهائيًا بمجرد خروج آخر رقم من الاستوديو.",
    },
    story: {
      fr: "Coupée pour la scène et la rue. L'épaule est tombante, le corps boxy, les poignets gardent leur forme après des années de port.",
      ar: "مقصوصة للمسرح والشارع. الكتف منخفض، والجسم واسع، والأساور تحافظ على شكلها بعد سنوات من الاستعمال.",
    },
    material: { fr: "Molleton de coton gratté 480 g/m², 100 % coton", ar: "قطن مبَرش ٤٨٠ غرام، قطن ١٠٠٪" },
    color: { fr: "Noir profond", ar: "أسود عميق" },
    care: {
      fr: "Lavage machine à froid, à l'envers. Ne pas passer au sèche-linge. Fer doux sur l'envers.",
      ar: "غسيل آلي بماء بارد على الوجه الداخلي. لا يُجفّف في الآلة. كيّ هادئ على الوجه الداخلي.",
    },
  },
  "culture-hoodie-001": {
    name: { fr: "CULTURE HOODIE 001", ar: "هودي الثقافة ٠٠١" },
    description: {
      fr: "La première forme que EL BATEL ait signée. Molleton teint en pièce avec un fini délavé, bord côte et étiquette tissée cousue dans la couture latérale.",
      ar: "أول قَصّة وضع EL BATEL اسمه عليها. قطن مصبوغ بالقطعة بلمسة مغسولة، حاشية مضلّعة، وعلامة منسوجة مخيطة في الخيط الجانبي.",
    },
    material: { fr: "Molleton de coton teint en pièce 420 g/m²", ar: "قطن مصبوغ بالقطعة ٤٢٠ غرام" },
    color: { fr: "Noir délavé", ar: "أسود مغسول" },
    care: {
      fr: "Lavage machine à froid avec des couleurs similaires. Séchage à plat.",
      ar: "غسيل آلي بماء بارد مع ألوان مشابهة. تُجفّف منشورة.",
    },
  },
  "blackout-oversized-hoodie": {
    name: { fr: "BLACKOUT OVERSIZED HOODIE", ar: "هودي العتمة الواسع" },
    description: {
      fr: "Monochrome, lumières éteintes. Le mot-symbole EL BATEL réfléchissant dans le dos n'apparaît qu'en pleine lumière — mat le jour, argenté au flash.",
      ar: "أحادي اللون، وكأن الأضواء انطفأت. شعار EL BATEL العاكس على الظهر لا يظهر إلا حين يلتقط الضوء — مطفأ في النهار، فضي أمام الفلاش.",
    },
    material: {
      fr: "Coton bouclette 460 g/m² avec transfert réfléchissant",
      ar: "قطن ٤٦٠ غرام مع طبعة عاكسة",
    },
    color: { fr: "Noir véritable", ar: "أسود صريح" },
    care: {
      fr: "Lavage à 30 °C sur l'envers. Ne pas repasser l'impression.",
      ar: "غسيل على ٣٠ درجة على الوجه الداخلي. لا تكوِ الطبعة.",
    },
  },
  "wear-the-culture-tee": {
    name: { fr: "WEAR THE CULTURE TEE", ar: "تيشيرت ارتدِ الثقافة" },
    description: {
      fr: "La pièce manifeste. Coupe boxy, coton 240 g/m², sérigraphiée à la main : aucune impression ne tombe exactement comme la précédente.",
      ar: "قطعة البيان. قَصّة واسعة، قطن ٢٤٠ غرام، ومطبوعة يدويًا فلا تتشابه أي طبعتين تمامًا.",
    },
    material: { fr: "Jersey de coton peigné 240 g/m²", ar: "جيرسي قطن ممشّط ٢٤٠ غرام" },
    color: { fr: "Blanc cassé", ar: "أبيض مكسور" },
    care: { fr: "Lavage machine à froid. Séchage à l'air. L'impression reste nette.", ar: "غسيل آلي بماء بارد. تُجفّف في الهواء. تبقى الطبعة حادة." },
  },
  "el-batel-monogram-tee": {
    name: { fr: "EL BATEL MONOGRAM TEE", ar: "تيشيرت المونوغرام" },
    description: {
      fr: "Monogramme tonal déployé sur toute la poitrine, petite étiquette numérotée à l'ourlet. Noir sur noir, lisible seulement de près.",
      ar: "المونوغرام بلون واحد منتشر على الصدر، وعلامة صغيرة مرقّمة عند الحاشية. أسود على أسود، لا يُقرأ إلا من قريب.",
    },
    material: { fr: "Jersey de coton compact 250 g/m²", ar: "جيرسي قطن مضغوط ٢٥٠ غرام" },
    color: { fr: "Noir", ar: "أسود" },
    care: { fr: "Lavage machine à froid, à l'envers.", ar: "غسيل آلي بماء بارد، على الوجه الداخلي." },
  },
  "numbered-tee-collector-run": {
    name: { fr: "NUMBERED TEE — SÉRIE COLLECTOR", ar: "تيشيرت مرقّم — إصدار المقتني" },
    description: {
      fr: "Cent t-shirts, cent numéros. Le numéro d'édition est imprimé dans l'étiquette de l'ourlet et correspond au numéro de votre carte de certificat.",
      ar: "مئة تيشيرت ومئة رقم. رقم الإصدار مطبوع في علامة الحاشية ويطابق الرقم على بطاقة الشهادة الخاصة بك.",
    },
    material: { fr: "Jersey de coton lourd 260 g/m²", ar: "جيرسي قطن ثقيل ٢٦٠ غرام" },
    color: { fr: "Blanc cassé", ar: "أبيض مكسور" },
    care: { fr: "Lavage à froid. Ne pas utiliser d'eau de javel.", ar: "غسيل بماء بارد. لا تستخدم المبيّض." },
  },
  "underground-cargo-pant": {
    name: { fr: "UNDERGROUND CARGO PANT", ar: "بنطال كارغو أندرغراوند" },
    description: {
      fr: "Cargo large en sergé de coton sec. Six poches, sangle cachée, cordons réglables en bas.",
      ar: "كارغو واسع من قماش قطني جاف. ست جيوب، حزام مخفي، ورباط قابل للتعديل عند الأسفل.",
    },
    material: { fr: "Sergé de coton sec, ferrures deadstock", ar: "قماش قطني جاف، وإكسسوارات مخزون قديم" },
    color: { fr: "Noir", ar: "أسود" },
    care: { fr: "Lavage machine à froid. Ne pas passer au sèche-linge.", ar: "غسيل آلي بماء بارد. لا يُجفّف في الآلة." },
  },
  "studio-track-pant": {
    name: { fr: "STUDIO TRACK PANT", ar: "بنطال الاستوديو" },
    description: {
      fr: "Le pantalon dans lequel il enregistre. Taille élastique, jambe fuselée, bande latérale avec le lettrage EL BATEL sur toute la longueur de la couture.",
      ar: "البنطال الذي يسجّل فيه. خصر مطاطي، ساق مضمّقة، وشريط جانبي يحمل حروف EL BATEL على طول الخيط.",
    },
    material: { fr: "Interlock en mélange polyester recyclé", ar: "خليط بوليستر معاد التصنيع" },
    color: { fr: "Noir / bande blanc cassé", ar: "أسود / شريط أبيض مكسور" },
    care: { fr: "Lavage à 30 °C. Tenir à l'écart du velcro.", ar: "غسيل على ٣٠ درجة. أبعدها عن اللاصق." },
  },
  "el-batel-tag-cap": {
    name: { fr: "CASQUETTE EL BATEL TAG", ar: "قبعة EL BATEL" },
    description: {
      fr: "Casquette six panneaux avec une plaque métallique découpée au laser sur le devant et le mot-symbole brodé à l'arrière.",
      ar: "قبعة بستة أجزاء مع لوحة معدنية مقصوصة بالليزر في المقدمة، والحروف مطرّزة في الخلف.",
    },
    material: { fr: "Twill de coton brossé, plaque métallique", ar: "قماش قطني مبَرش، لوحة معدنية" },
    color: { fr: "Noir", ar: "أسود" },
    care: { fr: "Nettoyage local uniquement.", ar: "تنظيف موضعي فقط." },
  },
  "collector-tote-numbered": {
    name: { fr: "TOTE COLLECTOR — NUMÉROTÉ", ar: "حقيبة المقتني — مرقّمة" },
    description: {
      fr: "Tote en toile épaisse, qualité studio, numéro imprimé à côté de l'anse. Cinquante pièces.",
      ar: "حقيبة من قماش سميك بجودة الاستوديو، والرقم مطبوع بجانب المقبض. خمسون قطعة.",
    },
    material: { fr: "Toile de coton 18 oz", ar: "قماش قطني ١٨ أونصة" },
    color: { fr: "Blanc cassé", ar: "أبيض مكسور" },
    care: { fr: "Lavage à la main.", ar: "غسيل يدوي." },
  },
  "el-batel-drop-002": {
    name: { fr: "EL BATEL — ÉDITION 002", ar: "EL BATEL — الإصدار ٠٠٢" },
    description: {
      fr: "La prochaine sortie. Quatre-vingts pièces, éditées une seule fois, numérotées à partir de 0001. Personne n'aura de seconde chance.",
      ar: "الطرح القادم. ثمانون قطعة، تُطرح مرة واحدة، مرقّمة من ٠٠٠١. ولا فرصة ثانية لأحد.",
    },
    material: { fr: "Molleton gratté 500 g/m²", ar: "قطن مبَرش ٥٠٠ غرام" },
    color: { fr: "Noir avec surpiqûre rouge", ar: "أسود بخيط أحمر" },
    care: { fr: "Lavage machine à froid, à l'envers.", ar: "غسيل آلي بماء بارد، على الوجه الداخلي." },
  },
  "archive-beanie": {
    name: { fr: "BONNET ARCHIVE", ar: "طاقية الأرشيف" },
    description: {
      fr: "Bonnet en côtes avec une étiquette archive tissée. Coupé court pour bien se poser.",
      ar: "طاقية مضلّعة بعلامة الأرشيف المنسوجة. مقصوصة قصيرة لتجلس بشكل نظيف.",
    },
    material: { fr: "Côtes en mélange laine vierge", ar: "خليط صوف مضلّع" },
    color: { fr: "Noir", ar: "أسود" },
    care: { fr: "Lavage à la main à froid.", ar: "غسيل يدوي بماء بارد." },
  },
};

export const COLLECTION_TRANSLATIONS: Record<
  string,
  { title: Localised; tagline: Localised; description: Localised }
> = {
  origin: {
    title: { fr: "ORIGINE", ar: "الأصل" },
    tagline: { fr: "LÀ OÙ TOUT A COMMENCÉ", ar: "حيث بدأ كل شيء" },
    description: {
      fr: "Les formes fondatrices — le hoodie, le t-shirt, le pantalon de training. Tout le reste de l'archive est une réaction à ces pièces.",
      ar: "القَصّات المؤسِّسة — الهودي والتيشيرت وبنطال التدريب. وكل ما في الأرشيف بعده ردّ فعل عليها.",
    },
  },
  blackout: {
    title: { fr: "BLACKOUT", ar: "العتمة" },
    tagline: { fr: "MONOCHROME UNIQUEMENT", ar: "أحادي اللون فقط" },
    description: {
      fr: "Noir sur noir. Impressions réfléchissantes, broderies tonales, ferrures qui disparaissent dans le noir.",
      ar: "أسود على أسود. طبعات عاكسة، تطريز بلون واحد، وإكسسوارات تختفي في الظلام.",
    },
  },
  limited: {
    title: { fr: "LIMITED", ar: "المحدود" },
    tagline: { fr: "NUMÉROTÉ · JAMAIS RÉPÉTÉ", ar: "مرقّم · لا يتكرّر أبدًا" },
    description: {
      fr: "Éditions numérotées. Chaque pièce porte son propre numéro, enregistré à son propriétaire, clos pour toujours à la fin de la série.",
      ar: "إصدارات مرقّمة. كل قطعة تحمل رقمها، مسجّلًا باسم صاحبه، ويُغلق الإصدار نهائيًا عند انتهاء السلسلة.",
    },
  },
};

export const HOMEPAGE_TRANSLATIONS = {
  fr: {
    eyebrow: "PIÈCES NUMÉROTÉES · SÉRIES LIMITÉES",
    heroTitle: "PORTEZ LA CULTURE.",
    heroSubtitle:
      "Chaque pièce est dessinée par EL BATEL, éditée une seule fois et numérotée. Quand une édition se ferme, elle ne revient jamais.",
    ctaPrimaryLabel: "VOIR L'ÉDITION",
    ctaSecondaryLabel: "DÉCOUVRIR EL BATEL",
    brandStatement: "PAS SEULEMENT DES VÊTEMENTS.\nUNE PART DE LA CULTURE.",
    brandSubstatement:
      "Dessiné au studio, réservé à ceux qui étaient là avant. Chaque pièce limitée porte son propre numéro de série — la trace de celui qui l'a portée.",
    sectionFeaturedTitle: "PIÈCES EN CIRCULATION",
    sectionDropTitle: "L'ÉDITION",
    sectionMusicTitle: "LE SON DERRIÈRE L'ARCHIVE",
  },
  ar: {
    eyebrow: "قطع مرقّمة · إصدارات محدودة",
    heroTitle: "ارتدِ الثقافة.",
    heroSubtitle:
      "كل قطعة يصمّمها EL BATEL، تُطرح مرة واحدة، وتحمل رقمها. وعندما يُغلق الإصدار لا يعود أبدًا.",
    ctaPrimaryLabel: "تسوّق الإصدار",
    ctaSecondaryLabel: "استكشف EL BATEL",
    brandStatement: "ليست ملابس فقط.\nقطعة من الثقافة.",
    brandSubstatement:
      "مصمّمة في الاستوديو، وموجّهة لمن كانوا هناك أولًا. كل قطعة محدودة تحمل رقمها التسلسلي — سجلّ لمن ارتداها.",
    sectionFeaturedTitle: "قطع في التداول",
    sectionDropTitle: "الإصدار",
    sectionMusicTitle: "الصوت خلف الأرشيف",
  },
};

export const ABOUT_TRANSLATIONS = {
  fr: {
    title: "EL BATEL",
    intro:
      "EL BATEL, c'est l'artiste, le son et le vestiaire. Le vêtement est la part de son travail que l'on peut emporter avec soi.",
    body:
      "Les vêtements portent l'identité de l'artiste, sa culture, son style et sa vision créative. Les couleurs restent proches du noir et du blanc parce que c'est ainsi que le travail se construit — fort dans le détail, discret partout ailleurs. Le rouge n'apparaît que là où il compte : le numéro de série, la couture, la ligne sous un nom.\n\nChaque pièce limitée est numérotée à la main à la clôture de la série. Le numéro est enregistré, la série s'arrête, et ce vêtement précis n'est jamais recoupé. Possédez la pièce et vous possédez le numéro qui va avec.",
    statement: "PAS SEULEMENT DES VÊTEMENTS. UNE PART DE LA CULTURE.",
  },
  ar: {
    title: "EL BATEL",
    intro:
      "EL BATEL هو الفنان والصوت والخزانة. والملابس هي الجزء من عمله الذي يمكنك أن تحمله معك.",
    body:
      "تحمل الملابس هوية الفنان وثقافته وأسلوبه ورؤيته الإبداعية. تبقى الألوان قريبة من الأسود والأبيض لأن العمل يُبنى هكذا — صاخبًا في التفاصيل، هادئًا في كل ما عداها. ولا يظهر الأحمر إلا حيث يهم: رقم التسلسل، والخيط، والخط تحت الاسم.\n\nكل قطعة محدودة تُرقَّم يدويًا عند إغلاق الإصدار. يُسجَّل الرقم، وينتهي الإصدار، ولا يُقصّ ذلك الثوب بعينه مرة أخرى. امتلك القطعة، وتملك الرقم الذي معها.",
    statement: "ليست ملابس فقط. قطعة من الثقافة.",
  },
};

export const SETTINGS_TRANSLATIONS = {
  fr: {
    shippingInfo:
      "Expédié dans le monde entier depuis le studio sous 3 à 5 jours ouvrés. Livraison suivie sur chaque commande. Les pièces numérotées partent dans une boîte collector scellée avec la carte de l'édition.",
    footerText:
      "EL BATEL — streetwear numéroté depuis le studio. Dessiné et édité en séries limitées.",
    announcement: "ÉDITION 002 — 80 PIÈCES · INSCRIPTION POUR L'ACCÈS ANTICIPÉ",
  },
  ar: {
    shippingInfo:
      "يُشحن إلى كل العالم من الاستوديو خلال ٣ إلى ٥ أيام عمل. توصيل متتبَّع مع كل طلب. تُشحن القطع المرقّمة في علبة المقتني المختومة مع بطاقة الإصدار.",
    footerText: "EL BATEL — ملابس شارع مرقّمة من الاستوديو. تُصمّم وتُطرح بإصدارات محدودة.",
    announcement: "الإصدار ٠٠٢ — ٨٠ قطعة · سجّل للوصول المبكر",
  },
};

export const MUSIC_TRANSLATIONS = {
  youtube: {
    fr: { title: "REGARDER SUR YOUTUBE", subtitle: "Clips officiels, visualiseurs et images du studio." },
    ar: { title: "شاهد على يوتيوب", subtitle: "الفيديوهات الرسمية والمشاهد من الاستوديو." },
  },
  spotify: {
    fr: { title: "ÉCOUTER SUR SPOTIFY", subtitle: "Le catalogue complet, playlists et featurings." },
    ar: { title: "استمع على سبوتيفاي", subtitle: "الكاتالوج الكامل وقوائم التشغيل والمشاركات." },
  },
};

/**
 * Backfill an already-seeded store. Idempotent: running it twice writes the
 * same values, and anything an admin has edited is simply overwritten with the
 * shipped translation (pass `onlyEmpty: true` to keep their edits).
 */
/**
 * Write the shipped translations onto the current catalogue. Shared by the
 * one-off backfill mutation below and by `seed.seedAll`, so a store built from
 * scratch and a store that was patched later end up identical.
 */
export async function applyTranslations(ctx: MutationCtx, options?: { onlyEmpty?: boolean }) {
    const onlyEmpty = options?.onlyEmpty ?? false;
    let products = 0;
    let collections = 0;
    let blocks = 0;

    const products_ = await ctx.db.query("products").collect();
    for (const product of products_) {
      const t = PRODUCT_TRANSLATIONS[product.slug];
      if (!t) continue;
      const patch: Record<string, unknown> = {};
      const put = (key: string, value: string) => {
        if (onlyEmpty && (product as Record<string, unknown>)[key]) return;
        patch[key] = value;
      };
      put("name_fr", t.name.fr);
      put("name_ar", t.name.ar);
      put("description_fr", t.description.fr);
      put("description_ar", t.description.ar);
      if (t.story) {
        put("story_fr", t.story.fr);
        put("story_ar", t.story.ar);
      }
      if (t.material) {
        put("material_fr", t.material.fr);
        put("material_ar", t.material.ar);
      }
      if (t.color) {
        put("color_fr", t.color.fr);
        put("color_ar", t.color.ar);
      }
      if (t.care) {
        put("care_fr", t.care.fr);
        put("care_ar", t.care.ar);
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(product._id, patch);
        products += 1;
      }
    }

    const collections_ = await ctx.db.query("collections").collect();
    for (const collection of collections_) {
      const t = COLLECTION_TRANSLATIONS[collection.slug];
      if (!t) continue;
      const patch: Record<string, unknown> = {};
      const put = (key: string, value: string) => {
        if (onlyEmpty && (collection as Record<string, unknown>)[key]) return;
        patch[key] = value;
      };
      put("title_fr", t.title.fr);
      put("title_ar", t.title.ar);
      put("tagline_fr", t.tagline.fr);
      put("tagline_ar", t.tagline.ar);
      put("description_fr", t.description.fr);
      put("description_ar", t.description.ar);
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(collection._id, patch);
        collections += 1;
      }
    }

    const home = await ctx.db
      .query("homepage_content")
      .withIndex("by_key", (q) => q.eq("key", "home"))
      .first();
    if (home) {
      await ctx.db.patch(home._id, {
        eyebrow_fr: HOMEPAGE_TRANSLATIONS.fr.eyebrow,
        eyebrow_ar: HOMEPAGE_TRANSLATIONS.ar.eyebrow,
        heroTitle_fr: HOMEPAGE_TRANSLATIONS.fr.heroTitle,
        heroTitle_ar: HOMEPAGE_TRANSLATIONS.ar.heroTitle,
        heroSubtitle_fr: HOMEPAGE_TRANSLATIONS.fr.heroSubtitle,
        heroSubtitle_ar: HOMEPAGE_TRANSLATIONS.ar.heroSubtitle,
        ctaPrimaryLabel_fr: HOMEPAGE_TRANSLATIONS.fr.ctaPrimaryLabel,
        ctaPrimaryLabel_ar: HOMEPAGE_TRANSLATIONS.ar.ctaPrimaryLabel,
        ctaSecondaryLabel_fr: HOMEPAGE_TRANSLATIONS.fr.ctaSecondaryLabel,
        ctaSecondaryLabel_ar: HOMEPAGE_TRANSLATIONS.ar.ctaSecondaryLabel,
        brandStatement_fr: HOMEPAGE_TRANSLATIONS.fr.brandStatement,
        brandStatement_ar: HOMEPAGE_TRANSLATIONS.ar.brandStatement,
        brandSubstatement_fr: HOMEPAGE_TRANSLATIONS.fr.brandSubstatement,
        brandSubstatement_ar: HOMEPAGE_TRANSLATIONS.ar.brandSubstatement,
        sectionFeaturedTitle: home.sectionFeaturedTitle ?? "PIECES IN CIRCULATION",
        sectionFeaturedTitle_fr: HOMEPAGE_TRANSLATIONS.fr.sectionFeaturedTitle,
        sectionFeaturedTitle_ar: HOMEPAGE_TRANSLATIONS.ar.sectionFeaturedTitle,
        sectionDropTitle: home.sectionDropTitle ?? "THE DROP",
        sectionDropTitle_fr: HOMEPAGE_TRANSLATIONS.fr.sectionDropTitle,
        sectionDropTitle_ar: HOMEPAGE_TRANSLATIONS.ar.sectionDropTitle,
        sectionMusicTitle: home.sectionMusicTitle ?? "THE SOUND BEHIND THE ARCHIVE",
        sectionMusicTitle_fr: HOMEPAGE_TRANSLATIONS.fr.sectionMusicTitle,
        sectionMusicTitle_ar: HOMEPAGE_TRANSLATIONS.ar.sectionMusicTitle,
        updatedAt: Date.now(),
      });
      blocks += 1;
    }

    const about = await ctx.db
      .query("about_content")
      .withIndex("by_key", (q) => q.eq("key", "about"))
      .first();
    if (about) {
      await ctx.db.patch(about._id, {
        title_fr: ABOUT_TRANSLATIONS.fr.title,
        title_ar: ABOUT_TRANSLATIONS.ar.title,
        intro_fr: ABOUT_TRANSLATIONS.fr.intro,
        intro_ar: ABOUT_TRANSLATIONS.ar.intro,
        body_fr: ABOUT_TRANSLATIONS.fr.body,
        body_ar: ABOUT_TRANSLATIONS.ar.body,
        statement_fr: ABOUT_TRANSLATIONS.fr.statement,
        statement_ar: ABOUT_TRANSLATIONS.ar.statement,
        updatedAt: Date.now(),
      });
      blocks += 1;
    }

    const settings = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    if (settings) {
      await ctx.db.patch(settings._id, {
        shippingInfo_fr: SETTINGS_TRANSLATIONS.fr.shippingInfo,
        shippingInfo_ar: SETTINGS_TRANSLATIONS.ar.shippingInfo,
        footerText_fr: SETTINGS_TRANSLATIONS.fr.footerText,
        footerText_ar: SETTINGS_TRANSLATIONS.ar.footerText,
        announcement_fr: SETTINGS_TRANSLATIONS.fr.announcement,
        announcement_ar: SETTINGS_TRANSLATIONS.ar.announcement,
        updatedAt: Date.now(),
      });
      blocks += 1;
    }

    const music = await ctx.db.query("music_links").collect();
    for (const link of music) {
      const t = MUSIC_TRANSLATIONS[link.platform];
      if (!t) continue;
      await ctx.db.patch(link._id, {
        title_fr: t.fr.title,
        title_ar: t.ar.title,
        subtitle_fr: t.fr.subtitle,
        subtitle_ar: t.ar.subtitle,
        updatedAt: Date.now(),
      });
      blocks += 1;
    }

    return { products, collections, blocks };
}

/** CLI/runtime entry point for the translation backfill. */
export const seedTranslations = internalMutation({
  args: { onlyEmpty: v.optional(v.boolean()) },
  handler: async (ctx, args) => await applyTranslations(ctx, { onlyEmpty: args.onlyEmpty }),
});
