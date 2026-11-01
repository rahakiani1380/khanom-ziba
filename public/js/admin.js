// خانوم زیبا - Admin panel (jQuery + Tailwind)
$(function () {
  let lang = localStorage.alang || 'fa', tk = sessionStorage.atk || null, tab = 'dash', editing = null;
  const SEOD = {
    fa: { seo: 'سئو (SEO)', seoHelp: 'این بخش تعیین می‌کند این صفحه در گوگل چطور دیده شود. اگر خالی بگذارید، سایت خودش یک متن مناسب می‌سازد.', seoTitle: 'عنوان در گوگل', seoTitleH: 'ایده‌آل: ۳۰ تا ۶۰ حرف. نام محصول + یک ویژگی مهم.', seoDesc: 'توضیح کوتاه در گوگل', seoDescH: 'ایده‌آل: ۷۰ تا ۱۶۰ حرف. بنویسید مشتری چرا باید کلیک کند.', seoKw: 'کلمات کلیدی (با ویرگول جدا کنید)', noindex: 'این صفحه در گوگل نمایش داده نشود (noindex)', serp: 'پیش‌نمایش در نتایج گوگل', seoAuto: '(توضیح خودکار ساخته می‌شود)', slug: 'نام آدرس صفحه (بدون فاصله)', altText: 'متن جایگزین عکس‌ها (Alt) — توضیح کوتاه از عکس', catSeoText: 'متن توضیحی سئو (زیر لیست محصولات این دسته نمایش داده می‌شود؛ ۱۵۰ تا ۳۰۰ کلمه عالی است)',
      s_audit: 'بررسی خودکار', s_general: 'تنظیمات کلی', s_pages: 'صفحات اصلی', s_redirects: 'انتقال آدرس‌ها', s_files: 'نقشه سایت و ثبت در گوگل',
      g_base: 'آدرس سایت (دامنه)', g_baseH: 'مثلاً https://khanomziba.ir — مهم‌ترین تنظیم؛ بدون / آخر و بدون مسیر.', g_site: 'نام سایت', g_tpl: 'قالب عنوان صفحه‌ها', g_tplH: '%s جای عنوان هر صفحه می‌نشیند. مثال: %s | خانوم زیبا', g_kw: 'کلمات کلیدی پیش‌فرض', g_kwH: 'اختیاری', g_desc: 'توضیح پیش‌فرض سایت', g_descH: 'برای صفحه‌هایی که توضیح ندارند. ۷۰ تا ۱۶۰ حرف.', g_og: 'تصویر پیش‌فرض اشتراک‌گذاری', g_ogH: 'عکسی که هنگام ارسال لینک در تلگرام و واتساپ دیده می‌شود (پیشنهاد: ۱۲۰۰×۶۳۰).', g_gsc: 'کد تأیید Google Search Console', g_gscH: 'فقط مقدار content را بنویسید.', g_bing: 'کد تأیید Bing', g_bingH: 'اختیاری', g_ga: 'شناسه Google Analytics (GA4)', g_gaH: 'برای دیدن آمار بازدید. شکل: G-XXXXXXXXXX', g_gtm: 'شناسه Google Tag Manager', g_gtmH: 'اختیاری. شکل: GTM-XXXXXXX', g_block: 'مسدود کردن سایت برای موتورهای جستجو', g_blockH: 'فقط وقتی سایت هنوز آماده نیست روشن کنید. تا وقتی روشن است، سایت در گوگل دیده نمی‌شود!',
      p_hint: 'عنوان و توضیح صفحه‌های اصلی سایت.', p_home: 'صفحه اصلی', p_products: 'صفحه همه محصولات', p_about: 'درباره ما',
      r_hint: 'اگر آدرس صفحه‌ای را عوض کردید یا صفحه‌ای حذف شد، آدرس قدیمی را به آدرس جدید وصل کنید تا امتیاز گوگل از بین نرود (انتقال دائمی ۳۰۱). آدرس‌ها با / شروع می‌شوند. اگر نام آدرس محصول یا دسته را عوض کنید، انتقال خودکار انجام می‌شود.', r_add: '＋ افزودن انتقال',
      f_intro: 'این دو فایل خودکار ساخته و همیشه به‌روز می‌شوند:', f_stepsT: 'ثبت سایت در گوگل (یک‌بار)', f_s1: 'به search.google.com/search-console بروید و با حساب گوگل وارد شوید.', f_s2: '«Add property» ← نوع «URL prefix» ← آدرس سایت را وارد کنید.', f_s3: 'روش «HTML tag» را انتخاب کنید، مقدار content را در «تنظیمات کلی» بگذارید و ذخیره کنید.', f_s4: 'برگردید و روی Verify بزنید.', f_s5: 'از منوی Sitemaps آدرس sitemap.xml را ثبت کنید.',
      a_title: 'امتیاز سئوی سایت', a_sub: 'هر مورد را با دکمه «اصلاح» درست کنید. 🔴 مهم، 🟠 بهتر است درست شود، 🔵 پیشنهاد.', a_fix: 'اصلاح', a_ok: 'همه چیز عالی است!',
      i_baseUrl: 'آدرس سایت (دامنه) تنظیم نشده؛ نقشه سایت و لینک‌ها ممکن است اشتباه ساخته شوند.', i_robotsBlock: 'سایت برای موتورهای جستجو مسدود است! گزینه «مسدود کردن» را خاموش کنید.', i_noOg: 'تصویر پیش‌فرض اشتراک‌گذاری (تلگرام/واتساپ) تنظیم نشده.', i_defDesc: 'توضیح پیش‌فرض سایت خالی یا کوتاه است (حداقل ۷۰ حرف).', i_noGsc: 'سایت در Google Search Console تأیید نشده.', i_noGa: 'ابزار آمار (Google Analytics) متصل نیست.', i_pageNoDesc: 'توضیح صفحه «{n}» خالی است.',
      i_noImage: 'محصول «{n}» تصویر ندارد.', i_thinText: 'توضیحات محصول «{n}» خیلی کوتاه است (حداقل ۵۰ حرف).', i_longTitle: 'عنوان سئوی «{n}» بیشتر از ۶۰ حرف است و در گوگل بریده می‌شود.', i_dupTitle: 'عنوان سئوی «{n}» با محصول دیگری یکی است.', i_noBrand: 'برند محصول «{n}» ثبت نشده.', i_noindexed: 'محصول «{n}» از گوگل مخفی شده (noindex).', i_catNoText: 'برای دسته «{n}» متن توضیحی سئو ننوشته‌اید.', i_catNoDesc: 'توضیح سئوی دسته «{n}» خالی است.' },
    en: { seo: 'SEO', seoHelp: 'Controls how this page looks in Google. If you leave it empty, the site writes a good text automatically.', seoTitle: 'Title in Google', seoTitleH: 'Ideal: 30–60 characters. Product name + one key feature.', seoDesc: 'Short description in Google', seoDescH: 'Ideal: 70–160 characters. Say why the customer should click.', seoKw: 'Keywords (comma separated)', noindex: 'Hide this page from Google (noindex)', serp: 'Google result preview', seoAuto: '(an automatic description is created)', slug: 'Page address name (no spaces)', altText: 'Image alt text — a short description of the photos', catSeoText: 'SEO text (shown under the products of this category; 150–300 words is great)',
      s_audit: 'Automatic check', s_general: 'General', s_pages: 'Main pages', s_redirects: 'Redirects', s_files: 'Sitemap & Google',
      g_base: 'Site address (domain)', g_baseH: 'Example: https://yourshop.ir — the most important setting; no trailing / and no path.', g_site: 'Site name', g_tpl: 'Page title template', g_tplH: '%s is replaced by each page title. Example: %s | My Shop', g_kw: 'Default keywords', g_kwH: 'Optional', g_desc: 'Default site description', g_descH: 'Used for pages without their own description. 70–160 characters.', g_og: 'Default share image', g_ogH: 'The picture shown when a link is sent in Telegram / WhatsApp (suggested: 1200×630).', g_gsc: 'Google Search Console verification code', g_gscH: 'Only the content value.', g_bing: 'Bing verification code', g_bingH: 'Optional', g_ga: 'Google Analytics ID (GA4)', g_gaH: 'To see visitor statistics. Format: G-XXXXXXXXXX', g_gtm: 'Google Tag Manager ID', g_gtmH: 'Optional. Format: GTM-XXXXXXX', g_block: 'Block search engines', g_blockH: 'Turn on only while the site is not ready. While on, Google cannot show your site!',
      p_hint: 'Title and description of the main pages.', p_home: 'Home page', p_products: 'All products page', p_about: 'About us',
      r_hint: 'If you change a page address or delete a page, connect the old address to the new one so Google keeps its ranking (permanent 301). Addresses start with /. Changing a product or category address name redirects automatically.', r_add: '＋ Add redirect',
      f_intro: 'These two files are created automatically and always up to date:', f_stepsT: 'Add the site to Google (one time)', f_s1: 'Go to search.google.com/search-console and sign in.', f_s2: '"Add property" → "URL prefix" → enter your site address.', f_s3: 'Choose "HTML tag", put the content value in "General", and save.', f_s4: 'Go back and press Verify.', f_s5: 'In the Sitemaps menu, submit sitemap.xml.',
      a_title: 'Site SEO score', a_sub: 'Fix each item with the Fix button. 🔴 important, 🟠 should fix, 🔵 suggestion.', a_fix: 'Fix', a_ok: 'Everything looks great!',
      i_baseUrl: 'Site address (domain) is not set; sitemap and links may be wrong.', i_robotsBlock: 'The site is blocked for search engines! Turn off "Block search engines".', i_noOg: 'No default share image (Telegram/WhatsApp).', i_defDesc: 'Default site description is empty or short (min 70 characters).', i_noGsc: 'Site is not verified in Google Search Console.', i_noGa: 'No analytics (Google Analytics) connected.', i_pageNoDesc: 'The "{n}" page has no description.',
      i_noImage: 'Product "{n}" has no image.', i_thinText: 'Product "{n}" description is too short (min 50 characters).', i_longTitle: 'SEO title of "{n}" is over 60 characters and will be cut in Google.', i_dupTitle: 'SEO title of "{n}" is the same as another product.', i_noBrand: 'Product "{n}" has no brand.', i_noindexed: 'Product "{n}" is hidden from Google (noindex).', i_catNoText: 'Category "{n}" has no SEO text.', i_catNoDesc: 'Category "{n}" has no SEO description.' } };
  const BD = {
    fa: { blog: 'مطالب (وبلاگ)', security: 'امنیت', addPost: '＋ مطلب جدید', postTitle: 'عنوان مطلب', postExcerpt: 'خلاصه کوتاه (در لیست مطالب و گوگل نمایش داده می‌شود)', postContent: 'متن مطلب', postStatus: 'وضعیت', published: 'منتشر شده', draft: 'پیش‌نویس', postDate: 'تاریخ انتشار', postTags: 'برچسب‌ها (با ویرگول جدا کنید)', postCover: 'تصویر شاخص مطلب', addImgToText: '🖼 افزودن عکس به متن', viewLive: 'مشاهده در سایت', sureP: 'این مطلب حذف شود؟', pcomments: 'نظرات مطالب', sureC: 'این نظر حذف شود؟', p_blog: 'صفحه مطالب',
      fmtHelp: 'قالب‌بندی ساده: ## عنوان بزرگ ، ### عنوان کوچک ، - لیست ، 1. لیست شماره‌دار ، > نقل‌قول ، **متن پررنگ** ، [متن لینک](آدرس) ، ![توضیح عکس](آدرس عکس). برای جدا کردن پاراگراف‌ها یک خط خالی بگذارید. بهتر است متن حداقل ۳۰۰ حرف باشد و عنوان‌های ## داشته باشد.',
      preview: '👁 پیش‌نمایش', pvTitle: 'پیش‌نمایش قبل از ثبت', pvConfirmNew: '✔ تایید و افزودن', pvConfirmSave: '✔ تایید و ذخیره', pvBack: 'بازگشت و ویرایش', pvCard: 'نمایش در لیست محصولات', pvWarn: 'نکات قابل بهبود',
      w_noImage: 'تصویر ندارد.', w_thin: 'توضیحات خیلی کوتاه است (کمتر از ۵۰ حرف).', w_seoLong: 'عنوان سئو بیشتر از ۶۰ حرف است.', w_noCover: 'تصویر شاخص ندارد.', w_noExcerpt: 'خلاصه خالی است (از ابتدای متن ساخته می‌شود).', w_short: 'متن کوتاه است (حداقل ۳۰۰ حرف توصیه می‌شود).', imgOk: 'عکس بهینه شد',
      sec_title: 'وضعیت امنیت سایت', sec_hint: 'هر مورد نارنجی را طبق راهنما درست کنید.', sec_pass_ok: 'رمز ادمین پیش‌فرض نیست.', sec_pass_bad: 'رمز ادمین هنوز پیش‌فرض است (admin123)! با متغیر ADMIN_PASS عوضش کنید.', sec_https_ok: 'اتصال امن HTTPS فعال است.', sec_https_bad: 'HTTPS فعال نیست. سایت را پشت HTTPS (مثلاً Cloudflare یا گواهی هاست) بگذارید؛ بدون آن رمزها و کدها قابل شنود هستند.',
      sec_key_ok: 'کلید رمزنگاری از APP_SECRET خوانده می‌شود.', sec_key_bad: 'کلید رمزنگاری در فایل data/secret.key است. روی سرور واقعی APP_SECRET بگذارید و کلید را جدا از دیتابیس نگه دارید و از آن پشتیبان بگیرید (با گم شدن کلید، اطلاعات مشتریان قابل خواندن نیست).', sec_prod_ok: 'حالت production فعال است.', sec_prod_bad: 'NODE_ENV=production تنظیم نیست و کد تأیید روی صفحه نشان داده می‌شود. این فقط برای نسخه آزمایشی درست است.',
      sec_cdn_ok: 'سایت پشت CDN/Cloudflare است (حمله‌های حجمی را آن‌ها می‌گیرند).', sec_cdn_bad: 'سایت مستقیم روی اینترنت است. برای جلوگیری از حمله‌های حجمی (DDoS) حتماً Cloudflare رایگان را جلوی سایت بگذارید و TRUST_PROXY=1 را تنظیم کنید.',
      sec_auto: 'محافظت‌های همیشه فعال (خودکار):', sec_a1: 'رمزنگاری اطلاعات مشتریان در دیتابیس (نام، آدرس، شماره) و نگهداری شماره به‌صورت هش.', sec_a2: 'محدودیت تعداد درخواست برای هر بازدیدکننده (ضد حمله و اسپم).', sec_a3: 'قفل ۱۰ دقیقه‌ای شماره بعد از درخواست زیاد کد یا ۵ کد اشتباه (فاصله ۱ دقیقه بین هر کد، حداکثر ۳ کد در ۱۰ دقیقه).', sec_a4: 'هدرهای امنیتی و CSP؛ جلوگیری از قرار گرفتن سایت داخل فریم سایت‌های دیگر.', sec_a5: 'ذخیره توکن ورود به‌صورت هش و انقضای ورود (مشتری ۳۰ روز، ادمین ۱۲ ساعت).', sec_a6: 'بررسی واقعی بودن فایل عکس‌های آپلودی و محدودیت حجم درخواست‌ها.', sec_a7: 'امن‌سازی خروجی همه متن‌ها (جلوگیری از XSS).', sec_users: 'تعداد مشتریان ثبت‌شده' },
    en: { blog: 'Blog', security: 'Security', addPost: '＋ New article', postTitle: 'Article title', postExcerpt: 'Short summary (shown in the list and in Google)', postContent: 'Article text', postStatus: 'Status', published: 'Published', draft: 'Draft', postDate: 'Publish date', postTags: 'Tags (comma separated)', postCover: 'Cover image', addImgToText: '🖼 Add image to text', viewLive: 'View on site', sureP: 'Delete this article?', pcomments: 'Article comments', sureC: 'Delete this comment?', p_blog: 'Blog page',
      fmtHelp: 'Simple formatting: ## big heading, ### small heading, - list, 1. numbered list, > quote, **bold**, [link text](address), ![image description](image address). Leave an empty line between paragraphs. Aim for at least 300 characters and use ## headings.',
      preview: '👁 Preview', pvTitle: 'Preview before saving', pvConfirmNew: '✔ Confirm & add', pvConfirmSave: '✔ Confirm & save', pvBack: 'Back to editing', pvCard: 'How it looks in the product list', pvWarn: 'Things to improve',
      w_noImage: 'No image.', w_thin: 'Description is very short (under 50 characters).', w_seoLong: 'SEO title is over 60 characters.', w_noCover: 'No cover image.', w_noExcerpt: 'Summary is empty (it will be made from the start of the text).', w_short: 'Text is short (at least 300 characters recommended).', imgOk: 'Image optimized',
      sec_title: 'Site security status', sec_hint: 'Fix every orange item using the guidance.', sec_pass_ok: 'Admin password is not the default.', sec_pass_bad: 'Admin password is still the default (admin123)! Change it with the ADMIN_PASS variable.', sec_https_ok: 'Secure HTTPS connection is active.', sec_https_bad: 'HTTPS is not active. Put the site behind HTTPS (Cloudflare or your host certificate); without it passwords and codes can be sniffed.',
      sec_key_ok: 'Encryption key comes from APP_SECRET.', sec_key_bad: 'The encryption key is in data/secret.key. On a real server set APP_SECRET, keep the key apart from the database and back it up (if the key is lost customer data cannot be read).', sec_prod_ok: 'Production mode is on.', sec_prod_bad: 'NODE_ENV=production is not set and the SMS code is shown on screen. That is only right for a test version.',
      sec_cdn_ok: 'The site is behind a CDN/Cloudflare (they absorb volume attacks).', sec_cdn_bad: 'The site is directly on the internet. To stop volume (DDoS) attacks put free Cloudflare in front and set TRUST_PROXY=1.',
      sec_auto: 'Always-on protections (automatic):', sec_a1: 'Customer data in the database (name, address, phone) is encrypted and phone numbers are stored hashed.', sec_a2: 'Request limit per visitor (anti-attack and anti-spam).', sec_a3: '10-minute lock of a phone number after too many code requests or 5 wrong codes (1 minute between codes, max 3 codes in 10 minutes).', sec_a4: 'Security headers and CSP; the site cannot be embedded in other sites.', sec_a5: 'Login tokens are stored hashed and expire (customers 30 days, admin 12 hours).', sec_a6: 'Uploaded images are verified to be real images; request size is limited.', sec_a7: 'All text output is escaped (XSS protection).', sec_users: 'Registered customers' } };
  const D = {
    fa: { title: 'پنل مدیریت', login: 'ورود مدیر', user: 'نام کاربری', pass: 'رمز عبور', enter: 'ورود', out: 'خروج', lang: 'English',
      dash: 'داشبورد', products: 'محصولات', orders: 'سفارش‌ها', users: 'کاربران', sProducts: 'محصولات', sUsers: 'کاربران', sOrders: 'سفارش‌ها', sRev: 'فروش (تومان)', sPend: 'در انتظار',
      add: '＋ محصول جدید', edit: 'ویرایش', del: 'حذف', sure: 'این محصول حذف شود؟', save: 'ذخیره', cancel: 'انصراف', saved: 'ذخیره شد', deleted: 'حذف شد',
      name_en: 'نام انگلیسی', name_fa: 'نام فارسی', cat: 'دسته', price: 'قیمت (تومان)', old: 'قیمت قبل از تخفیف', emoji: 'ایموجی', color: 'رنگ پس‌زمینه', de: 'توضیح انگلیسی', df: 'توضیح فارسی',
      rating: 'امتیاز', name: 'نام', date: 'تاریخ', customer: 'مشتری', items: 'اقلام', total: 'مبلغ', status: 'وضعیت', phone: 'موبایل', city: 'شهر', address: 'آدرس', post: 'کد پستی', cnt: 'تعداد سفارش', none: 'موردی نیست.', recent: 'آخرین سفارش‌ها',
      dev: 'دستگاه‌ها', vit: 'ویتامین‌ها', aid: 'کمک‌های اولیه', ortho: 'ارتوپدی', hyg: 'بهداشتی',
      pending: 'در انتظار', processing: 'در حال آماده‌سازی', shipped: 'ارسال شد', delivered: 'تحویل شد', canceled: 'لغو شد',
      categories: 'دسته‌بندی‌ها', banners: 'بنرها', parent: 'دسته والد', root: '— دسته اصلی —', icon: 'آیکون (ایموجی)', addCat: '＋ دسته جدید', addBan: '＋ بنر جدید', sureCat: 'این دسته حذف شود؟', sureBan: 'این بنر حذف شود؟', slot: 'محل نمایش', main: 'اسلایدر اصلی', side: 'بنر کناری', active: 'فعال', tfa: 'عنوان فارسی', ten: 'عنوان انگلیسی', pfa: 'متن فارسی', pen: 'متن انگلیسی', bgc: 'رنگ پس‌زمینه', txc: 'رنگ متن', image: 'تصویر بنر', imgUrl: 'آدرس تصویر (یا فایل بالا را انتخاب کنید)', imgHint: 'png / jpg / webp، حداکثر ۲٫۵ مگابایت. اندازه پیشنهادی: ۱۴۰۰×۶۰۰', link: 'لینک بنر', noLink: 'بدون لینک', allProducts: 'همه محصولات', e_haschildren: 'این دسته زیرمجموعه دارد. اول زیرمجموعه‌ها را حذف یا جابه‌جا کنید.', e_inuse: 'در این دسته محصول وجود دارد. اول محصولات را به دسته دیگر ببرید.', e_toolarge: 'حجم تصویر زیاد است (حداکثر ۲٫۵ مگابایت).', pimgs: 'تصاویر محصول', pimgsHint: 'می‌توانید چند تصویر انتخاب کنید (تا ۸ عدد). تصویر اول در لیست محصولات نمایش داده می‌شود.', specs: 'مشخصات محصول', addSpec: '＋ افزودن مشخصه', s_tfa: 'عنوان (مثلاً سایز)', s_vfa: 'مقدار (مثلاً ۴۲)', s_ten: 'Title (English, optional)', s_ven: 'Value (English, optional)', offers: 'تخفیف ویژه', addOffer: '＋ بخش تخفیف جدید', percent: 'درصد تخفیف', endAt: 'پایان تخفیف', ended: 'تمام شد', pick: 'محصولات این بخش', sureOff: 'این بخش تخفیف حذف شود؟', offHint: 'تا قبل از پایان زمان، قیمت‌ها در کل سایت (لیست، صفحه محصول، سبد و سفارش) با تخفیف نمایش داده می‌شوند و تایمر روی صفحه اصلی معکوس می‌شود.', announce: 'نوار اعلان', annHint: 'پیام‌های نوار بالای سایت. به ترتیب و با انیمیشن نمایش داده می‌شوند. اگر فقط یک پیام بگذارید ثابت می‌ماند.', interval: 'ثانیه بین پیام‌ها', messages: 'پیام‌ها (به ترتیب نمایش)', addMsg: '＋ افزودن پیام', a_fa: 'متن فارسی', a_en: 'English text', comment: 'نظر', sureRev: 'این نظر حذف شود؟', brand: 'برند', allBrands: 'همه برندها', tickBrand: 'تیک همه محصولات این برند', slides: 'تصویر', addSlide: '＋ افزودن تصویر دیگر', bint: 'ثانیه بین تصاویر', bannerHint: 'در صفحه اصلی فقط اولین بنر فعال «اسلایدر اصلی» و دو بنر فعال اول «بنر کناری» نمایش داده می‌شوند. چند تصویر را داخل یک بنر بگذارید تا خودکار عوض شوند.', footer: 'فوتر', e_login: 'نشست منقضی شد. دوباره وارد شوید.', e_badlogin: 'نام کاربری یا رمز اشتباه است.', e_locked: 'تلاش‌های زیاد. ۱۵ دقیقه بعد دوباره امتحان کنید.', e_invalid: 'اطلاعات نامعتبر است (نام‌ها، دسته و قیمت لازم‌اند؛ قیمت قبلی باید بیشتر باشد).', e_notfound: 'پیدا نشد.', e_server: 'خطای سرور.' },
    en: { title: 'Admin panel', login: 'Admin login', user: 'Username', pass: 'Password', enter: 'Login', out: 'Log out', lang: 'فارسی',
      dash: 'Dashboard', products: 'Products', orders: 'Orders', users: 'Users', sProducts: 'Products', sUsers: 'Users', sOrders: 'Orders', sRev: 'Revenue (Toman)', sPend: 'Pending',
      add: '＋ New product', edit: 'Edit', del: 'Delete', sure: 'Delete this product?', save: 'Save', cancel: 'Cancel', saved: 'Saved', deleted: 'Deleted',
      name_en: 'English name', name_fa: 'Persian name', cat: 'Category', price: 'Price (Toman)', old: 'Old price', emoji: 'Emoji', color: 'Background color', de: 'English description', df: 'Persian description',
      rating: 'Rating', name: 'Name', date: 'Date', customer: 'Customer', items: 'Items', total: 'Total', status: 'Status', phone: 'Mobile', city: 'City', address: 'Address', post: 'Postal code', cnt: 'Orders', none: 'Nothing here yet.', recent: 'Recent orders',
      dev: 'Devices', vit: 'Vitamins', aid: 'First aid', ortho: 'Orthopedic', hyg: 'Hygiene',
      pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', canceled: 'Canceled',
      categories: 'Categories', banners: 'Banners', parent: 'Parent category', root: '— Top level —', icon: 'Icon (emoji)', addCat: '＋ New category', addBan: '＋ New banner', sureCat: 'Delete this category?', sureBan: 'Delete this banner?', slot: 'Position', main: 'Main slider', side: 'Side banner', active: 'Active', tfa: 'Persian title', ten: 'English title', pfa: 'Persian text', pen: 'English text', bgc: 'Background color', txc: 'Text color', image: 'Banner image', imgUrl: 'Image URL (or choose a file above)', imgHint: 'png / jpg / webp, max 2.5 MB. Suggested size: 1400×600', link: 'Banner link', noLink: 'No link', allProducts: 'All products', e_haschildren: 'This category has sub-categories. Delete or move them first.', e_inuse: 'This category has products. Move the products to another category first.', e_toolarge: 'Image is too large (max 2.5 MB).', pimgs: 'Product images', pimgsHint: 'You can choose several images (up to 8). The first image is shown in product lists.', specs: 'Specifications', addSpec: '＋ Add specification', s_tfa: 'Title (Persian)', s_vfa: 'Value (Persian)', s_ten: 'Title (English, optional)', s_ven: 'Value (English, optional)', offers: 'Special offers', addOffer: '＋ New offer section', percent: 'Discount %', endAt: 'Offer ends', ended: 'Ended', pick: 'Products in this section', sureOff: 'Delete this offer section?', offHint: 'Until the end time, prices are discounted everywhere on the site (lists, product page, bag and orders) and the home page timer counts down.', announce: 'Announcement bar', annHint: 'Messages shown in the bar at the top of the site, one after another with an animation. One message stays fixed.', interval: 'Seconds between messages', messages: 'Messages (in display order)', addMsg: '＋ Add message', a_fa: 'Persian text', a_en: 'English text', comment: 'Comment', sureRev: 'Delete this review?', brand: 'Brand', allBrands: 'All brands', tickBrand: 'Tick all products of this brand', slides: 'images', addSlide: '＋ Add another image', bint: 'Seconds between images', bannerHint: 'On the home page only the first active main banner and the first two active side banners are shown. Put several images inside one banner to make them change automatically.', footer: 'Footer', e_login: 'Session expired. Please login again.', e_badlogin: 'Wrong username or password.', e_locked: 'Too many tries. Try again in 15 minutes.', e_invalid: 'Invalid data (names, category and price are required; old price must be higher).', e_notfound: 'Not found.', e_server: 'Server error.' }
  };
  let cats = [], editCat = null, editBan = null, pimgs = [], pspecs = [], editOff = null, allP = [], pann = { items: [] }, brandList = [], fBrand = '', pslides = [], seoTab = 'audit', seoCfg = { pages: {} }, prd = [], editPost = null, pvOk = null;
  const STAT = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
  const SC = { pending: 'bg-amber-100', processing: 'bg-sky-100', shipped: 'bg-indigo-100', delivered: 'bg-emerald-100', canceled: 'bg-red-100' };
  const t = k => D[lang][k] || SEOD[lang][k] || BD[lang][k] || k, num = x => Number(x || 0).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inp = 'w-full border rounded-xl px-3 py-2 bg-paper', btn = 'bg-brand text-white rounded-xl px-4 py-2 font-semibold', box = 'bg-white border rounded-2xl p-5';
  const date = d => new Date(d).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  const kidsOf = pid => cats.filter(c => (c.parent || null) === pid);
  const flat = (pid = null, d = 0) => kidsOf(pid).flatMap(c => [{ c, d }, ...flat(c.id, d + 1)]);
  const descIds = id => [id, ...kidsOf(id).flatMap(c => descIds(c.id))];
  const catName = id => { const c = cats.find(x => x.id === id); return c ? c[lang] : id; };
  const catOpts = (sel, ex = []) => flat().filter(x => !ex.includes(x.c.id)).map(({ c, d }) => `<option value="${esc(c.id)}" ${c.id === sel ? 'selected' : ''}>${'— '.repeat(d)}${esc(c[lang])}</option>`).join('');
  const fld = (id, label, val, extra = '') => `<div><label class="block font-semibold mb-1" for="${id}">${label}</label><input id="${id}" class="${inp}" value="${esc(val)}" ${extra}></div>`;
  const ta = (id, label, val, dir = '') => `<div><label class="block font-semibold mb-1" for="${id}">${label}</label><textarea id="${id}" rows="2" class="${inp}" ${dir}>${esc(val)}</textarea></div>`;
  const catForm = c => { c = c || { icon: '📁', parent: null }; const ex = c.id ? descIds(c.id) : [];
    return `<form id="cf" class="${box} mb-6"><div class="grid sm:grid-cols-2 gap-3">${fld('cfa', t('name_fa'), c.fa)}${fld('cen', t('name_en'), c.en, 'dir="ltr"')}${fld('cic', t('icon'), c.icon)}
      <div><label class="block font-semibold mb-1" for="cpar">${t('parent')}</label><select id="cpar" class="${inp}"><option value="">${t('root')}</option>${catOpts(c.parent, ex)}</select></div>${fld('cslug', t('slug'), c.slug || '', 'dir="ltr"')}<div class="sm:col-span-2">${ta('cseotext', t('catSeoText'), c.seoText || '')}</div>${seoBox('c', { title: c.seoTitle, desc: c.seoDesc, noindex: c.noindex }, '/products/' + (c.slug || '…'), '#cfa', '')}</div>
      <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button> <button type="button" id="cancel" class="border rounded-xl px-4 py-2">${t('cancel')}</button></form>`; };
  const FT = [['hoursFa', 'ساعت کاری (فارسی)', 'Working hours (Persian)'], ['hoursEn', 'ساعت کاری (انگلیسی)', 'Working hours (English)'], ['phones', 'شماره‌های تماس (هر خط یک شماره، حداکثر ۴)', 'Phone numbers (one per line, max 4)', 1], ['email', 'ایمیل', 'Email'],
    ['addrFa', 'آدرس (فارسی)', 'Address (Persian)'], ['addrEn', 'آدرس (انگلیسی)', 'Address (English)'], ['telegram', 'لینک تلگرام (https://…)', 'Telegram link (https://…)'], ['instagram', 'لینک اینستاگرام', 'Instagram link'],
    ['linkedin', 'لینک لینکدین', 'LinkedIn link'], ['whatsapp', 'لینک واتساپ', 'WhatsApp link'], ['copyFa', 'متن کپی‌رایت (فارسی)', 'Copyright (Persian)'], ['copyEn', 'متن کپی‌رایت (انگلیسی)', 'Copyright (English)'],
    ['seoTitleFa', 'عنوان متن زیر فوتر (فارسی)', 'Text-block title (Persian)'], ['seoTitleEn', 'عنوان متن زیر فوتر (انگلیسی)', 'Text-block title (English)'], ['seoFa', 'متن زیر فوتر (فارسی)', 'Text block (Persian)', 1], ['seoEn', 'متن زیر فوتر (انگلیسی)', 'Text block (English)', 1]];
  const linkOpts = sel => `<option value="">${t('noLink')}</option><option value="#/products" ${sel === '#/products' ? 'selected' : ''}>${t('allProducts')}</option>` + flat().map(({ c, d }) => { const v = '#/products/' + c.id; return `<option value="${esc(v)}" ${sel === v ? 'selected' : ''}>${'— '.repeat(d)}${esc(c[lang])}</option>`; }).join('');
  const newSlide = () => ({ image: '', link: '', tfa: '', ten: '', pfa: '', pen: '', bg: '#6d49e8', color: '#ffffff' });
  const slideRows = () => pslides.map((x, i) => `<div data-slide="${i}" class="border rounded-2xl p-3 mb-3 bg-paper"><div class="flex items-center justify-between mb-2"><b>#${i + 1}</b>
    <span class="flex gap-1"><button type="button" data-mvslide="${i}" data-dir="-1" class="border rounded-lg px-2" aria-label="up">↑</button><button type="button" data-mvslide="${i}" data-dir="1" class="border rounded-lg px-2" aria-label="down">↓</button><button type="button" data-rmslide="${i}" class="border border-red-300 text-red-600 rounded-lg px-2" aria-label="remove">×</button></span></div>
    <div class="grid sm:grid-cols-2 gap-3">
      <div class="sm:col-span-2"><label class="block font-semibold mb-1">${t('image')}</label><input data-sfile type="file" accept="image/png,image/jpeg,image/webp" class="${inp}"><input data-sl="image" class="${inp} mt-2" dir="ltr" placeholder="${t('imgUrl')}" value="${esc(x.image)}">${x.image ? `<img src="${esc(x.image)}" alt="" class="h-16 mt-2 rounded-lg">` : ''}</div>
      <div class="sm:col-span-2"><label class="block font-semibold mb-1">${t('link')}</label><select data-sl="link" class="${inp}">${linkOpts(x.link)}</select></div>
      <div><label class="block font-semibold mb-1">${t('tfa')}</label><input data-sl="tfa" class="${inp}" value="${esc(x.tfa)}"></div><div><label class="block font-semibold mb-1">${t('ten')}</label><input data-sl="ten" dir="ltr" class="${inp}" value="${esc(x.ten)}"></div>
      <div><label class="block font-semibold mb-1">${t('pfa')}</label><input data-sl="pfa" class="${inp}" value="${esc(x.pfa)}"></div><div><label class="block font-semibold mb-1">${t('pen')}</label><input data-sl="pen" dir="ltr" class="${inp}" value="${esc(x.pen)}"></div>
      <div><label class="block font-semibold mb-1">${t('bgc')}</label><input data-sl="bg" type="color" class="${inp} h-11 p-1" value="${esc(x.bg)}"></div><div><label class="block font-semibold mb-1">${t('txc')}</label><input data-sl="color" type="color" class="${inp} h-11 p-1" value="${esc(x.color)}"></div>
    </div></div>`).join('');
  const banForm = b => { b = b || { slot: 'main', active: true, interval: 5, slides: [newSlide()] }; pslides = b.slides.map(x => ({ ...x }));
    return `<form id="bf" class="${box} mb-6"><p class="text-sm text-slate-500 mb-3">${t('bannerHint')}</p><div class="grid sm:grid-cols-3 gap-3">
      <div><label class="block font-semibold mb-1" for="slot">${t('slot')}</label><select id="slot" class="${inp}"><option value="main" ${b.slot === 'main' ? 'selected' : ''}>${t('main')}</option><option value="side" ${b.slot === 'side' ? 'selected' : ''}>${t('side')}</option></select></div>
      ${fld('bint', t('bint'), b.interval, 'type="number" min="2" max="60" dir="ltr"')}<label class="flex items-center gap-2 mt-7"><input id="act" type="checkbox" class="!w-auto" ${b.active ? 'checked' : ''}> ${t('active')}</label></div>
      <div class="font-semibold mt-4 mb-2">${t('slides')}</div><div id="slides">${slideRows()}</div><button type="button" id="addslide" class="border rounded-xl px-4 py-1">${t('addSlide')}</button>
      <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${editBan ? t('save') : t('preview') + ' & ' + t('pvConfirmNew')}</button> <button type="button" id="banpv" class="border border-brand text-brand rounded-2xl px-4 py-2">${t('preview')}</button> <button type="button" id="cancel" class="border rounded-xl px-4 py-2">${t('cancel')}</button></form>`; };
  const thumbsHtml = () => pimgs.map((u, i) => `<div class="relative"><img src="${esc(u)}" alt="" class="w-16 h-16 object-cover rounded-lg border"><button type="button" data-rmimg="${i}" class="absolute -top-2 -end-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm" aria-label="remove">×</button></div>`).join('');

  const specRows = () => pspecs.map((x, i) => `<div data-srow="${i}" class="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 mb-2">
    <input data-sf="tfa" class="${inp}" placeholder="${t('s_tfa')}" value="${esc(x.tfa)}"><input data-sf="vfa" class="${inp}" placeholder="${t('s_vfa')}" value="${esc(x.vfa)}">
    <input data-sf="ten" dir="ltr" class="${inp}" placeholder="${t('s_ten')}" value="${esc(x.ten)}"><input data-sf="ven" dir="ltr" class="${inp}" placeholder="${t('s_ven')}" value="${esc(x.ven)}">
    <button type="button" data-rmspec="${i}" class="border border-red-300 text-red-600 rounded-xl px-3" aria-label="remove">×</button></div>`).join('');
  const toLocal = iso => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const offerForm = o => { o = o || { tfa: '', ten: '', percent: 20, end: new Date(Date.now() + 7 * 864e5).toISOString(), bg: '#c0392b', color: '#ffffff', products: [], active: true };
    return `<form id="of" class="${box} mb-6"><p class="text-sm text-slate-500 mb-3">${t('offHint')}</p><div class="grid sm:grid-cols-2 gap-3">
      ${fld('otfa', t('tfa'), o.tfa)}${fld('oten', t('ten'), o.ten, 'dir="ltr"')}${fld('opct', t('percent'), o.percent, 'type="number" min="1" max="90" dir="ltr"')}
      <div><label class="block font-semibold mb-1" for="oend">${t('endAt')}</label><input id="oend" type="datetime-local" class="${inp}" dir="ltr" value="${toLocal(o.end)}"></div>
      <div><label class="block font-semibold mb-1" for="obg">${t('bgc')}</label><input id="obg" type="color" class="${inp} h-11 p-1" value="${esc(o.bg)}"></div>
      <div><label class="block font-semibold mb-1" for="otx">${t('txc')}</label><input id="otx" type="color" class="${inp} h-11 p-1" value="${esc(o.color)}"></div>
      <label class="flex items-center gap-2"><input id="oact" type="checkbox" class="!w-auto" ${o.active ? 'checked' : ''}> ${t('active')}</label>
      <div class="sm:col-span-2"><div class="font-semibold mb-1">${t('pick')}</div>${brandList.length ? `<div class="flex gap-2 mb-2"><select id="obrandsel" class="${inp} !w-auto"><option value="">${t('allBrands')}</option>${brandList.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join('')}</select><button type="button" id="obrandadd" class="border rounded-xl px-3 py-1">${t('tickBrand')}</button></div>` : ''}<div class="max-h-64 overflow-auto border rounded-xl p-3 grid sm:grid-cols-2 gap-1">${allP.map(p => `<label class="flex items-center gap-2"><input type="checkbox" class="!w-auto" data-op="${p.id}" ${o.products.includes(p.id) ? 'checked' : ''}> ${esc(p[lang])} <span class="text-slate-400 text-sm">${num(p.p)}</span></label>`).join('')}</div></div></div>
      <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button> <button type="button" id="cancel" class="border rounded-xl px-4 py-2">${t('cancel')}</button></form>`; };

  const annRows = () => pann.items.map((x, i) => `<div data-arow="${i}" class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2"><input data-af="fa" class="${inp}" placeholder="${t('a_fa')}" value="${esc(x.fa)}"><input data-af="en" dir="ltr" class="${inp}" placeholder="${t('a_en')}" value="${esc(x.en)}">
    <span class="flex gap-1"><button type="button" data-armv="${i}" data-dir="-1" class="border rounded-lg px-2" aria-label="up">↑</button><button type="button" data-armv="${i}" data-dir="1" class="border rounded-lg px-2" aria-label="down">↓</button><button type="button" data-arm="${i}" class="border border-red-300 text-red-600 rounded-lg px-2" aria-label="remove">×</button></span></div>`).join('');
  const annForm = () => `<h2 class="text-xl font-extrabold mb-4">${t('announce')}</h2><form id="af" class="${box}"><p class="text-sm text-slate-500 mb-3">${t('annHint')}</p>
    <div id="apv" class="rounded-xl text-center py-2 mb-4 font-semibold" style="background:${esc(pann.bg)};color:${esc(pann.color)}">${esc((pann.items[0] && (pann.items[0][lang] || pann.items[0].fa)) || '…')}</div>
    <div class="grid sm:grid-cols-3 gap-3"><div><label class="block font-semibold mb-1" for="abg">${t('bgc')}</label><input id="abg" type="color" class="${inp} h-11 p-1" value="${esc(pann.bg)}"></div>
      <div><label class="block font-semibold mb-1" for="atx">${t('txc')}</label><input id="atx" type="color" class="${inp} h-11 p-1" value="${esc(pann.color)}"></div>${fld('aint', t('interval'), pann.interval, 'type="number" min="2" max="30" dir="ltr"')}</div>
    <label class="flex items-center gap-2 mt-3"><input id="aact" type="checkbox" class="!w-auto" ${pann.active ? 'checked' : ''}> ${t('active')}</label>
    <div class="font-semibold mt-4 mb-2">${t('messages')}</div><div id="arows">${annRows()}</div><button type="button" id="aadd" class="border rounded-xl px-4 py-1">${t('addMsg')}</button>
    <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button></form>`;

  // ---------- SEO helpers: a box with title / description / noindex + live Google preview ----------
  const seoBox = (id, v, path, fbT, fbD, noIdx) => `<div class="sm:col-span-2 border-2 border-emerald-200 rounded-2xl p-3 bg-white" data-seobox="${id}" data-path="${esc(path)}" data-fbt="${esc(fbT || '')}" data-fbd="${esc(fbD || '')}">
    <div class="font-bold mb-1">🔍 ${t('seo')}</div><p class="text-xs text-slate-500 mb-3">${t('seoHelp')}</p><div class="grid gap-3">
      <div><label class="block font-semibold mb-1">${t('seoTitle')} <span data-cnt="title"></span></label><input data-seo="title" class="${inp}" value="${esc(v.title)}"><p class="text-xs text-slate-400">${t('seoTitleH')}</p></div>
      <div><label class="block font-semibold mb-1">${t('seoDesc')} <span data-cnt="desc"></span></label><textarea data-seo="desc" rows="2" class="${inp}">${esc(v.desc)}</textarea><p class="text-xs text-slate-400">${t('seoDescH')}</p></div>
      <div><label class="block font-semibold mb-1">${t('seoKw')}</label><input data-seo="keywords" class="${inp}" value="${esc(v.keywords)}"></div>
      ${noIdx ? '' : `<label class="flex items-center gap-2"><input type="checkbox" data-seo="noindex" class="!w-auto" ${v.noindex ? 'checked' : ''}> ${t('noindex')}</label>`}</div>
    <div class="mt-3 rounded-xl bg-slate-50 border p-3"><div class="text-xs text-slate-400 mb-1">${t('serp')}</div><div data-serp></div></div></div>`;
  function updSeo($b) {
    const g = k => $b.find('[data-seo="' + k + '"]'), ti = g('title').val() || '', de = g('desc').val() || '';
    const fb = a => ($b.attr(a) ? $($b.attr(a)).val() : '') || '';
    const cnt = (k, n, lo, hi) => $b.find('[data-cnt="' + k + '"]').text(num(n) + '/' + num(hi)).attr('class', 'text-xs ' + (n === 0 ? 'text-slate-400' : n >= lo && n <= hi ? 'text-emerald-600' : 'text-amber-600'));
    cnt('title', ti.length, 30, 60); cnt('desc', de.length, 70, 160);
    $b.find('[data-serp]').html(`<div class="text-xs text-emerald-700" dir="ltr">${esc(location.origin + $b.attr('data-path'))}</div><div class="text-blue-700 text-lg leading-snug">${esc((ti || fb('data-fbt') || '…').slice(0, 70))}</div><div class="text-sm text-slate-600">${esc((de || fb('data-fbd') || t('seoAuto')).slice(0, 170))}</div>`);
  }
  const seoVals = id => { const $b = $('[data-seobox="' + id + '"]'); return { title: $b.find('[data-seo=title]').val(), desc: $b.find('[data-seo=desc]').val(), keywords: $b.find('[data-seo=keywords]').val(), noindex: $b.find('[data-seo=noindex]').is(':checked') }; };

  // ---------- SEO tab (automatic check, general settings, main pages, redirects, sitemap) ----------
  const auditView = au => {
    const col = au.score >= 80 ? 'text-emerald-600' : au.score >= 50 ? 'text-amber-600' : 'text-red-600', lv = { error: ['🔴', 'bg-red-50'], warn: ['🟠', 'bg-amber-50'], info: ['🔵', 'bg-sky-50'] };
    const order = ['error', 'warn', 'info'], list = [...au.issues].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
    return `<div class="${box} mb-4 flex items-center gap-5"><div class="text-5xl font-extrabold ${col}">${num(au.score)}<span class="text-lg text-slate-400">/${num(100)}</span></div><div><b>${t('a_title')}</b><div class="text-sm text-slate-500">${t('a_sub')}</div></div></div>` +
      (list.length ? list.map(i => `<div class="${box} !p-3 mb-2 flex items-center gap-3 ${lv[i.level][1]}"><span>${lv[i.level][0]}</span><span class="flex-1">${t('i_' + i.code).replace('{n}', esc(i.name ? i.name[lang] : ''))}</span><button data-fix="${i.area}:${esc(i.id == null ? '' : i.id)}" class="border rounded-lg px-3 py-1 bg-white">${t('a_fix')}</button></div>`).join('') : `<p class="${box}">✅ ${t('a_ok')}</p>`);
  };
  const genView = () => {
    const g = seoCfg, row = (id, lbl, val, hint, extra = '') => `<div>${fld(id, lbl, val, extra)}<p class="text-xs text-slate-400">${hint}</p></div>`;
    return `<form id="sg" class="${box}"><div class="grid sm:grid-cols-2 gap-3">
      ${row('gbase', t('g_base'), g.baseUrl, t('g_baseH'), 'dir="ltr" placeholder="https://yourshop.ir"')}${row('gsite', t('g_site'), g.siteName, '')}${row('gtpl', t('g_tpl'), g.titleTpl, t('g_tplH'))}${row('gkw', t('g_kw'), g.defKeywords, t('g_kwH'))}
      <div class="sm:col-span-2">${ta('gdesc', t('g_desc'), g.defDesc)}<p class="text-xs text-slate-400">${t('g_descH')}</p></div>
      <div class="sm:col-span-2"><label class="block font-semibold mb-1" for="ogfile">${t('g_og')}</label><input id="ogfile" type="file" accept="image/png,image/jpeg,image/webp" class="${inp}"><input id="ogimg" class="${inp} mt-2" dir="ltr" placeholder="${t('imgUrl')}" value="${esc(g.ogImage)}"><p class="text-xs text-slate-400">${t('g_ogH')}</p>${g.ogImage ? `<img src="${esc(g.ogImage)}" alt="" class="h-20 mt-2 rounded-lg">` : ''}</div>
      ${row('ggsc', t('g_gsc'), g.gsc, t('g_gscH'), 'dir="ltr"')}${row('gbing', t('g_bing'), g.bing, t('g_bingH'), 'dir="ltr"')}${row('gga', t('g_ga'), g.ga, t('g_gaH'), 'dir="ltr" placeholder="G-XXXXXXXXXX"')}${row('ggtm', t('g_gtm'), g.gtm, t('g_gtmH'), 'dir="ltr" placeholder="GTM-XXXXXXX"')}
      <label class="sm:col-span-2 flex items-start gap-2 bg-red-50 rounded-xl p-3"><input id="gblock" type="checkbox" class="!w-auto mt-1" ${g.robotsBlock ? 'checked' : ''}><span><b>${t('g_block')}</b><br><span class="text-sm">${t('g_blockH')}</span></span></label></div>
      <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button></form>`;
  };
  const pagesView = () => `<form id="sp" class="${box}"><p class="text-sm text-slate-500 mb-3">${t('p_hint')}</p><div class="grid gap-4">${[['home', '/'], ['products', '/products'], ['blog', '/blog'], ['about', '/about']].map(([k, pth]) => `<div><div class="font-bold mb-1">${t('p_' + k)}</div><div class="grid">${seoBox('pg-' + k, seoCfg.pages[k] || {}, pth, '', '', true)}</div></div>`).join('')}</div>
    <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button></form>`;
  const rdrRows = () => prd.map((r, i) => `<div data-rrow="${i}" class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2"><input data-rf="from" dir="ltr" class="${inp}" placeholder="/old-address" value="${esc(r.from)}"><input data-rf="to" dir="ltr" class="${inp}" placeholder="/new-address" value="${esc(r.to)}"><button type="button" data-rrm="${i}" class="border border-red-300 text-red-600 rounded-xl px-3" aria-label="remove">×</button></div>`).join('');
  const rdrView = () => `<form id="sr" class="${box}"><p class="text-sm text-slate-500 mb-3">${t('r_hint')}</p><div id="rrows">${rdrRows()}</div><button type="button" id="radd" class="border rounded-xl px-4 py-1">${t('r_add')}</button><p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button></form>`;
  const filesView = () => { const lk = p => `<a href="${p}" target="_blank" rel="noopener" class="text-brand underline" dir="ltr">${esc(location.origin + p)}</a>`;
    return `<div class="${box}"><p class="mb-3">${t('f_intro')}</p><p>📄 sitemap: ${lk('/sitemap.xml')}</p><p>🤖 robots: ${lk('/robots.txt')}</p><h3 class="font-bold mt-5 mb-2">${t('f_stepsT')}</h3><ol class="list-decimal ps-5 space-y-1 text-sm">${[1, 2, 3, 4, 5].map(i => `<li>${t('f_s' + i)}</li>`).join('')}</ol></div>`; };
  const seoView = au => `<h2 class="text-xl font-extrabold mb-3">${t('seo')}</h2><div class="flex gap-2 flex-wrap mb-4">${['audit', 'general', 'pages', 'redirects', 'files'].map(k => `<button data-stab="${k}" class="border rounded-full px-4 py-1 ${seoTab === k ? 'bg-brand text-white border-brand' : 'bg-white'}">${t('s_' + k)}</button>`).join('')}</div>` + ({ audit: () => auditView(au), general: genView, pages: pagesView, redirects: rdrView, files: filesView }[seoTab])();

  // ---------- images: big photos are shrunk in the browser before upload (the quality loss is invisible) ----------
  function compressImage(file, maxDim) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, maxDim / Math.max(img.width, img.height)), w = Math.round(img.width * k), h = Math.round(img.height * k);
        const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
        const read = b => { const fr = new FileReader(); fr.onload = () => resolve({ data: fr.result, before: file.size, after: b.size }); fr.readAsDataURL(b); };
        const encode = (q, done) => c.toBlob(b => { if (b && b.type === 'image/webp') done(b); else c.toBlob(b2 => b2 ? done(b2) : reject(new Error('compress')), 'image/jpeg', q); }, 'image/webp', q);
        encode(0.82, b => {
          if (b.size <= 2.4 * 1024 * 1024) return (k === 1 && file.size <= b.size && /^image\/(png|webp)$/.test(file.type) && file.size <= 2.4 * 1024 * 1024) ? read(file) : read(b); // re-encoding also removes GPS/EXIF data
          encode(0.7, b2 => (b2.size > 2.4 * 1024 * 1024 && maxDim > 600) ? compressImage(file, Math.round(maxDim * 0.7)).then(resolve, reject) : read(b2));
        });
      };
      img.onerror = () => reject(new Error('read'));
      img.src = url;
    });
  }
  async function uploadImage(file, maxDim) {
    const r = await compressImage(file, maxDim || 1600), x = await api('POST', '/api/admin/upload', { data: r.data });
    if (r.before > r.after * 1.4) toast(t('imgOk') + ' (' + (r.before / 1048576).toFixed(1) + ' → ' + (r.after / 1048576).toFixed(2) + ' MB)');
    return x.url;
  }

  // ---------- preview window: see the new item before it is added ----------
  function showPv(html, label, onOk) {
    $('#pvm').remove(); pvOk = onOk;
    $('body').append(`<div id="pvm" class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true"><div class="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-auto shadow-2xl">
      <div class="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between z-10"><b>${t('pvTitle')}</b><button id="pvx" class="text-2xl leading-none" aria-label="close">×</button></div><div class="p-5">${html}</div>
      <div class="sticky bottom-0 bg-white border-t px-5 py-3 flex gap-2 justify-end"><button id="pvback" class="border rounded-xl px-4 py-2">${t('pvBack')}</button><button id="pvok" class="${btn}">${label}</button></div></div></div>`);
  }
  const warnBox = ws => ws.length ? `<div class="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><b>⚠️ ${t('pvWarn')}</b><ul class="list-disc ps-5">${ws.map(w => `<li>${t(w)}</li>`).join('')}</ul></div>` : '';
  const serpBox = (title, desc, path) => `<div class="mt-3 rounded-xl bg-slate-50 border p-3"><div class="text-xs text-slate-400 mb-1">${t('serp')}</div><div class="text-xs text-emerald-700" dir="ltr">${esc(location.origin + path)}</div><div class="text-blue-700 text-lg leading-snug">${esc((title || '…').slice(0, 70))}</div><div class="text-sm text-slate-600">${esc((desc || t('seoAuto')).slice(0, 170))}</div></div>`;
  const productBody = () => ({ en: $('#en').val(), fa: $('#fa').val(), c: $('#c').val(), p: $('#p').val(), o: $('#o').val(), e: $('#e').val(), bg: $('#bg').val(), de: $('#de').val(), df: $('#df').val(), images: pimgs, specs: pspecs, brand: $('#brand').val(), seo: { ...seoVals('p'), slug: $('#pslug').val(), alt: $('#palt').val() } });
  const productPreview = b => {
    const p = Number(b.p) || 0, o = Number(b.o) || 0, disc = o > p ? Math.round((1 - p / o) * 100) : 0, img = b.images[0], nm = (lang === 'fa' ? b.fa : b.en) || b.fa || b.en, sp = b.specs.filter(s => (s.tfa || s.ten) && (s.vfa || s.ven));
    const ws = [!b.images.length && 'w_noImage', String(b.df || '').length < 50 && 'w_thin', (b.seo.title || '').length > 60 && 'w_seoLong'].filter(Boolean);
    return `<div class="grid md:grid-cols-[215px_1fr] gap-5"><div><div class="text-xs text-slate-400 mb-1">${t('pvCard')}</div>
      <div class="w-52 rounded-3xl border bg-white shadow-lg overflow-hidden"><div class="relative m-2 h-40 rounded-2xl overflow-hidden grid place-items-center text-6xl" style="background:linear-gradient(145deg,${esc(b.bg)},#fff)">${disc ? `<span class="absolute top-2 start-2 text-white text-xs font-bold rounded-full px-2 py-0.5" style="background:linear-gradient(135deg,#ff7a59,#ff5c8a)">${num(disc)}%</span>` : ''}${img ? `<img src="${esc(img)}" alt="" class="w-full h-full object-cover">` : esc(b.e || '📦')}</div>
      <div class="p-3 pt-1">${b.brand ? `<div class="text-xs font-semibold text-brand">${esc(b.brand)}</div>` : ''}<b class="block leading-6">${esc(nm)}</b><div class="mt-2 font-extrabold text-brand">${num(p)} ${lang === 'fa' ? 'تومان' : 'Toman'}</div>${disc ? `<s class="text-xs text-slate-400">${num(o)}</s>` : ''}</div></div></div>
      <div class="text-sm space-y-1"><div><b>${t('name_fa')}:</b> ${esc(b.fa)} · <b>${t('name_en')}:</b> <span dir="ltr">${esc(b.en)}</span></div><div><b>${t('cat')}:</b> ${esc(catName(b.c))}${b.brand ? ` · <b>${t('brand')}:</b> ${esc(b.brand)}` : ''}</div>
        <div class="text-slate-600 whitespace-pre-line">${esc(lang === 'fa' ? b.df : b.de)}</div>
        ${sp.length ? `<table class="w-full mt-2 text-start">${sp.map(s => `<tr class="border-t"><th class="text-start p-1 w-1/3 bg-slate-50">${esc(s.tfa || s.ten)}</th><td class="p-1">${esc(s.vfa || s.ven)}</td></tr>`).join('')}</table>` : ''}
        ${b.images.length ? `<div class="flex gap-2 flex-wrap mt-2">${b.images.map(u => `<img src="${esc(u)}" class="h-14 w-14 rounded-lg object-cover border" alt="">`).join('')}</div>` : ''}
        ${serpBox(b.seo.title || b.fa, b.seo.desc || b.df, '/product/…')}${warnBox(ws)}</div></div>`;
  };
  const saveProduct = body => api(editing ? 'PUT' : 'POST', '/api/admin/products' + (editing ? '/' + editing : ''), body).done(() => { editing = null; toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
  const bannerBody = () => ({ slot: $('#slot').val(), active: $('#act').is(':checked'), interval: $('#bint').val(), slides: pslides });
  const bannerPreview = b => `<div class="text-sm mb-2">${t(b.slot)} · ${num(b.slides.length)} ${t('slides')} · ${num(b.interval)}s</div><div class="grid gap-3">${b.slides.map(x => `<div class="rounded-[1.5rem] p-6 min-h-[130px] flex flex-col justify-center" style="background-color:${esc(x.bg)};color:${esc(x.color)};${x.image ? `background-image:url('${esc(x.image)}');background-size:cover;background-position:center` : ''}"><b class="text-xl">${esc(x[lang === 'fa' ? 'tfa' : 'ten'] || x.tfa || x.ten)}</b><span>${esc(x[lang === 'fa' ? 'pfa' : 'pen'] || '')}</span>${x.link ? `<small class="mt-1 opacity-80" dir="ltr">→ ${esc(x.link)}</small>` : ''}</div>`).join('')}</div>`;
  const saveBanner = body => api(editBan ? 'PUT' : 'POST', '/api/admin/banners' + (editBan ? '/' + editBan : ''), body).done(() => { editBan = null; toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
  const postBody = () => ({ title: $('#ptitle').val(), slug: $('#pslug2').val(), status: $('#pstatus').val(), excerpt: $('#pexcerpt').val(), content: $('#pbody').val(), cover: $('#pcover').val().trim(), alt: $('#palt2').val(), tags: $('#ptags').val(), date: $('#pdate').val() ? new Date($('#pdate').val()).toISOString() : '', seo: seoVals('post') });
  const savePost = body => api(editPost ? 'PUT' : 'POST', '/api/admin/posts' + (editPost ? '/' + editPost : ''), body).done(() => { editPost = null; toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
  const previewPost = (b, label) => api('POST', '/api/admin/render', { content: b.content }).done(r => {
    const ws = [!b.cover && 'w_noCover', !String(b.excerpt).trim() && 'w_noExcerpt', String(b.content).length < 300 && 'w_short', (b.seo.title || b.title).length > 60 && 'w_seoLong'].filter(Boolean);
    showPv(`<h2 class="text-2xl font-extrabold mb-1">${esc(b.title)}</h2><div class="text-sm text-slate-500 mb-3">${t(b.status)} · ${date(b.date || new Date())}</div>${b.cover ? `<img src="${esc(b.cover)}" alt="" class="w-full rounded-2xl mb-4">` : ''}<div class="post">${r.html}</div>${serpBox(b.seo.title || b.title, b.seo.desc || b.excerpt, '/blog/…')}${warnBox(ws)}`, label, () => savePost(b));
  }).fail(x => toast(t(errKey(x))));
  const postForm = p => {
    p = p || { title: '', slug: '', excerpt: '', content: '', cover: '', alt: '', tags: [], status: 'published', date: new Date().toISOString(), seo: {} };
    return `<form id="pof" class="${box} mb-6"><div class="grid sm:grid-cols-2 gap-3">
      <div class="sm:col-span-2">${fld('ptitle', t('postTitle'), p.title)}</div>${fld('pslug2', t('slug'), p.slug, 'dir="ltr"')}
      <div><label class="block font-semibold mb-1" for="pstatus">${t('postStatus')}</label><select id="pstatus" class="${inp}"><option value="published" ${p.status === 'published' ? 'selected' : ''}>${t('published')}</option><option value="draft" ${p.status === 'draft' ? 'selected' : ''}>${t('draft')}</option></select></div>
      <div class="sm:col-span-2">${ta('pexcerpt', t('postExcerpt'), p.excerpt)}</div>
      <div class="sm:col-span-2"><label class="block font-semibold mb-1" for="pbody">${t('postContent')}</label><p class="text-xs text-slate-500 mb-2">${t('fmtHelp')}</p><textarea id="pbody" rows="14" class="${inp}">${esc(p.content)}</textarea>
        <label class="border rounded-xl px-4 py-1 cursor-pointer inline-block mt-2">${t('addImgToText')}<input id="pbimg" type="file" accept="image/*" class="hidden"></label></div>
      <div class="sm:col-span-2"><label class="block font-semibold mb-1" for="pcoverf">${t('postCover')}</label><input id="pcoverf" type="file" accept="image/*" class="${inp}"><input id="pcover" class="${inp} mt-2" dir="ltr" value="${esc(p.cover)}" placeholder="${t('imgUrl')}"><div id="pcoverpv">${p.cover ? `<img src="${esc(p.cover)}" alt="" class="h-24 mt-2 rounded-lg">` : ''}</div></div>
      ${fld('palt2', t('altText'), p.alt)}${fld('ptags', t('postTags'), (p.tags || []).join('، '))}
      <div><label class="block font-semibold mb-1" for="pdate">${t('postDate')}</label><input id="pdate" type="datetime-local" class="${inp}" dir="ltr" value="${toLocal(p.date)}"></div>
      ${seoBox('post', p.seo || {}, '/blog/…', '#ptitle', '#pexcerpt')}</div>
      <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${editPost ? t('save') : t('preview') + ' & ' + t('pvConfirmNew')}</button> <button type="button" id="postpv" class="border border-brand text-brand rounded-2xl px-4 py-2">${t('preview')}</button> <button type="button" id="cancel" class="border rounded-xl px-4 py-2">${t('cancel')}</button></form>`;
  };

  function api(method, url, data) {
    return $.ajax({ method, url, contentType: 'application/json', data: data ? JSON.stringify(data) : undefined, headers: tk ? { Authorization: 'Bearer ' + tk } : {} });
  }
  const errKey = x => 'e_' + ((x.responseJSON && x.responseJSON.error) || 'server');
  function toast(m) { $('#toast').text(m).css('opacity', 1); clearTimeout(toast.t); toast.t = setTimeout(() => $('#toast').css('opacity', 0), 2000); }
  function fail(x) { if (x.status === 401 && tk) { tk = null; sessionStorage.removeItem('atk'); } toast(t(errKey(x))); draw(); }

  // ---------- screens ----------
  const loginView = () => `<div class="min-h-screen grid place-items-center p-4"><form id="lf" class="${box} w-full max-w-sm">
    <h1 class="text-2xl font-extrabold text-brand mb-2">خانوم زیبا · ${t('login')}</h1>
    <label class="block font-semibold mt-3 mb-1" for="u">${t('user')}</label><input id="u" class="${inp}" dir="ltr" autocomplete="username">
    <label class="block font-semibold mt-3 mb-1" for="p">${t('pass')}</label><input id="p" type="password" class="${inp}" dir="ltr" autocomplete="current-password">
    <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn} w-full">${t('enter')}</button>
    <button type="button" id="lang" class="mt-3 border rounded-full px-3 py-1 text-sm">${t('lang')}</button></form></div>`;

  const shell = body => `<header class="bg-white border-b"><div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
    <b class="text-xl text-brand">خانوم زیبا · ${t('title')}</b><div class="flex-1"></div>
    <button id="lang" class="border rounded-full px-3 py-1">${t('lang')}</button><button id="out" class="border rounded-full px-3 py-1">${t('out')}</button></div>
    <nav class="max-w-6xl mx-auto px-4 flex gap-5 border-t overflow-x-auto">${['dash', 'seo', 'blog', 'products', 'categories', 'banners', 'offers', 'announce', 'reviews', 'footer', 'orders', 'users', 'security'].map(k => `<button data-tab="${k}" class="py-2 border-b-2 whitespace-nowrap ${tab === k ? 'border-brand text-brand font-semibold' : 'border-transparent'}">${t(k)}</button>`).join('')}</nav></header>
    <main class="max-w-6xl mx-auto px-4 py-6">${body}</main>`;

  const table = (heads, rows) => rows.length ? `<div class="${box} !p-0 overflow-x-auto"><table class="w-full text-start text-sm"><thead class="bg-slate-50"><tr>${heads.map(h => `<th class="p-3 text-start font-semibold">${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr class="border-t">${r.map(c => `<td class="p-3 align-top">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<p class="${box}">${t('none')}</p>`;
  const statusSel = o => `<select data-status="${o.id}" class="rounded-lg border px-2 py-1 ${SC[o.status]}">${STAT.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${t(s)}</option>`).join('')}</select>`;
  const cust = o => { const c = o.customer || {}; return `<b>${esc(c.firstName)} ${esc(c.lastName)}</b><br><span dir="ltr">${esc(c.phone)}</span><br><span class="text-slate-500">${esc(c.city)} – ${esc(c.address)}<br>${t('post')}: ${esc(c.postalCode)}</span>`; };
  const itemsOf = (o, P) => o.items.map(i => { const p = P.find(x => x.id == i.id); return `${esc(p ? p[lang] : '#' + i.id)} × ${num(i.qty)}`; }).join('<br>');

  function formView(p) {
    p = p || { c: 'dev', bg: '#e3f1f0', e: '📦' };
    pimgs = [...(p.images || [])]; pspecs = (p.specs || []).map(x => ({ ...x }));
    const f = (id, label, val, extra = '') => `<div><label class="block font-semibold mb-1" for="${id}">${label}</label><input id="${id}" class="${inp}" value="${esc(val)}" ${extra}></div>`;
    return `<form id="pf" class="${box} mb-6"><div class="grid sm:grid-cols-2 gap-3">
      ${f('en', t('name_en'), p.en, 'dir="ltr"')}${f('fa', t('name_fa'), p.fa)}${f('brand', t('brand'), p.brand || '', 'list="brandlist"')}<datalist id="brandlist">${brandList.map(b => `<option value="${esc(b)}">`).join('')}</datalist>
      <div><label class="block font-semibold mb-1" for="c">${t('cat')}</label><select id="c" class="${inp}">${catOpts(p.c)}</select></div>
      ${f('p', t('price'), p.p || '', 'type="number" min="1" dir="ltr"')}${f('o', t('old'), p.o || '', 'type="number" min="1" dir="ltr"')}${f('e', t('emoji'), p.e)}
      <div><label class="block font-semibold mb-1" for="bg">${t('color')}</label><input id="bg" type="color" class="${inp} h-11 p-1" value="${esc(p.bg)}"></div><div></div>
      <div><label class="block font-semibold mb-1" for="de">${t('de')}</label><textarea id="de" rows="3" class="${inp}" dir="ltr">${esc(p.de)}</textarea></div>
      <div><label class="block font-semibold mb-1" for="df">${t('df')}</label><textarea id="df" rows="3" class="${inp}">${esc(p.df)}</textarea></div>
      <div class="sm:col-span-2"><label class="block font-semibold mb-1" for="pfile">${t('pimgs')}</label><input id="pfile" type="file" multiple accept="image/png,image/jpeg,image/webp" class="${inp}"><div id="pthumbs" class="flex flex-wrap gap-3 mt-3">${thumbsHtml()}</div><p class="text-sm text-slate-500">${t('pimgsHint')}</p></div>
      <div class="sm:col-span-2"><div class="font-semibold mb-1">${t('specs')}</div><div id="specs">${specRows()}</div><button type="button" id="addspec" class="border rounded-xl px-4 py-1">${t('addSpec')}</button></div>${f('pslug', t('slug'), (p.seo || {}).slug || '', 'dir="ltr" placeholder="digital-thermometer"')}${f('palt', t('altText'), (p.seo || {}).alt || '')}${seoBox('p', p.seo || {}, '/product/' + (p.id || '…'), '#fa', '#df')}</div>
      <p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${editing ? t('save') : t('preview') + ' & ' + t('pvConfirmNew')}</button> <button type="button" id="pvbtn" class="border border-brand text-brand rounded-2xl px-4 py-2">${t('preview')}</button> <button type="button" id="cancel" class="border rounded-xl px-4 py-2">${t('cancel')}</button></form>`;
  }

  const tabs = {
    dash: () => $.when(api('GET', '/api/admin/stats'), api('GET', '/api/admin/orders'), api('GET', '/api/admin/products')).then((a, b, c) => {
      const s = a[0], card = (l, v, cl) => `<div class="${box}"><div class="text-slate-500">${l}</div><div class="text-3xl font-extrabold ${cl || ''}">${num(v)}</div></div>`;
      return `<div class="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 mb-8">${card(t('sProducts'), s.products)}${card(t('sUsers'), s.users)}${card(t('sOrders'), s.orders)}${card(t('sPend'), s.pending, 'text-amber-600')}${card(t('sRev'), s.revenue, 'text-brand')}</div>
        <h2 class="text-xl font-extrabold mb-3">${t('recent')}</h2>` + table([t('date'), t('customer'), t('items'), t('total'), t('status')],
        b[0].slice(0, 5).map(o => [date(o.date), cust(o), itemsOf(o, c[0]), num(o.total), statusSel(o)]));
    }),
    products: () => api('GET', '/api/admin/products').then(P => `<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-extrabold">${t('products')}</h2><div class="flex gap-2 items-center"><select id="fbrand" class="${inp} !w-auto"><option value="">${t('allBrands')}</option>${brandList.map(b => `<option value="${esc(b)}" ${fBrand === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select><button id="new" class="${btn}">${t('add')}</button></div></div>
      ${editing !== null ? formView(editing === 0 ? null : P.find(x => x.id === editing)) : ''}` +
      table(['', t('name'), t('brand'), t('cat'), t('price'), t('rating'), ''], P.filter(p => !fBrand || p.brand === fBrand).map(p => [`<span class="inline-grid place-items-center w-10 h-10 rounded-lg text-xl" style="background:${esc(p.bg)}">${esc(p.e)}</span>`,
        `<b>${esc(p[lang])}</b>`, esc(p.brand || '—'), esc(catName(p.c)), num(p.p) + (p.o ? `<br><s class="text-slate-400">${num(p.o)}</s>` : ''), `★ ${num(p.r)} (${num(p.n)})`,
        `<button data-edit="${p.id}" class="border rounded-lg px-3 py-1">${t('edit')}</button> <button data-del="${p.id}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button>`]))),
    orders: () => $.when(api('GET', '/api/admin/orders'), api('GET', '/api/admin/products')).then((a, b) => table(['#', t('date'), t('customer'), t('items'), t('total'), t('status')],
      a[0].map(o => [`<span dir="ltr">${o.id}</span>`, date(o.date), cust(o), itemsOf(o, b[0]), `<b>${num(o.total)}</b>`, statusSel(o)]))),
    categories: () => {
      const rows = (pid, d) => cats.filter(c => (c.parent || null) === pid).map(c => `<div class="flex flex-wrap items-center gap-2 border-t py-2" style="padding-inline-start:${d * 24}px"><span class="text-xl">${esc(c.icon)}</span><b>${esc(c.fa)}</b><span class="text-slate-400" dir="ltr">${esc(c.en)}</span><span class="flex-1"></span>
        <button data-ecat="${esc(c.id)}" class="border rounded-lg px-3 py-1">${t('edit')}</button> <button data-dcat="${esc(c.id)}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button></div>${rows(c.id, d + 1)}`).join('');
      return `<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-extrabold">${t('categories')}</h2><button id="newCat" class="${btn}">${t('addCat')}</button></div>
        ${editCat !== null ? catForm(editCat === 0 ? null : cats.find(x => x.id === editCat)) : ''}<div class="${box} !py-2">${rows(null, 0) || t('none')}</div>`;
    },
    banners: () => api('GET', '/api/admin/banners').then(B => {
      const bs = x => `background-color:${esc(x.bg)};color:${esc(x.color)};` + (x.image ? `background-image:url('${esc(x.image)}');background-size:cover;background-position:center;` : '');
      const list = B.map(b => { const x = b.slides[0]; return `<div class="${box} flex flex-wrap items-center gap-3 mb-3"><div class="w-40 h-20 rounded-xl p-2 overflow-hidden text-sm font-bold" style="${bs(x)}">${esc(x['t' + lang])}</div>
        <div class="flex-1 min-w-[150px]"><b>${esc(x.tfa || x.ten || '—')}</b><div class="text-slate-500 text-sm">${t(b.slot)} · ${num(b.slides.length)} ${t('slides')} · ${num(b.interval)}s · ${b.active ? t('active') : '—'}</div></div>
        <button data-bmove="${esc(b.id)}" data-dir="-1" class="border rounded-lg px-3 py-1" aria-label="up">↑</button><button data-bmove="${esc(b.id)}" data-dir="1" class="border rounded-lg px-3 py-1" aria-label="down">↓</button>
        <button data-eban="${esc(b.id)}" class="border rounded-lg px-3 py-1">${t('edit')}</button><button data-dban="${esc(b.id)}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button></div>`; }).join('');
      return `<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-extrabold">${t('banners')}</h2><button id="newBan" class="${btn}">${t('addBan')}</button></div>
        ${editBan !== null ? banForm(editBan === 0 ? null : B.find(x => x.id === editBan)) : ''}${list || `<p class="${box}">${t('none')}</p>`}`;
    }),
    offers: () => $.when(api('GET', '/api/admin/offers'), api('GET', '/api/admin/products')).then((a, b) => {
      const O = a[0]; allP = b[0];
      const list = O.map(o => `<div class="${box} flex flex-wrap items-center gap-3 mb-3"><div class="w-32 h-16 rounded-xl p-2 text-sm font-bold overflow-hidden" style="background:${esc(o.bg)};color:${esc(o.color)}">${esc(o['t' + lang])}</div>
        <div class="flex-1 min-w-[160px]"><b>${esc(o.tfa || o.ten)}</b> <span class="text-brand font-bold">${num(o.percent)}%</span>
          <div class="text-slate-500 text-sm">${t('endAt')}: ${date(o.end)} ${new Date(o.end) < new Date() ? `<b class="text-red-600">· ${t('ended')}</b>` : ''} · ${num(o.products.length)} ${t('products')}${o.active ? '' : ' · —'}</div></div>
        <button data-omove="${esc(o.id)}" data-dir="-1" class="border rounded-lg px-3 py-1" aria-label="up">↑</button><button data-omove="${esc(o.id)}" data-dir="1" class="border rounded-lg px-3 py-1" aria-label="down">↓</button>
        <button data-eoff="${esc(o.id)}" class="border rounded-lg px-3 py-1">${t('edit')}</button><button data-doff="${esc(o.id)}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button></div>`).join('');
      return `<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-extrabold">${t('offers')}</h2><button id="newOff" class="${btn}">${t('addOffer')}</button></div>
        ${editOff !== null ? offerForm(editOff === 0 ? null : O.find(x => x.id === editOff)) : ''}${list || `<p class="${box}">${t('none')}</p>`}`;
    }),
    announce: () => api('GET', '/api/admin/announce').then(a => { pann = a; return annForm(); }),
    reviews: () => api('GET', '/api/admin/reviews').then(R => table([t('products'), t('customer'), t('rating'), t('comment'), t('date'), ''], R.map(r => [esc(r.product[lang]), esc(r.name) + `<br><span dir="ltr" class="text-slate-500">${esc(r.phone)}</span>`, '★'.repeat(r.stars), `<span class="whitespace-pre-line">${esc(r.text)}</span>`, date(r.date), `<button data-drev="${esc(r.pid)}|${esc(r.uid)}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button>`]))),
    footer: () => api('GET', '/api/admin/footer').then(f => `<h2 class="text-xl font-extrabold mb-4">${t('footer')}</h2><form id="ff" class="${box}"><div class="grid sm:grid-cols-2 gap-3">${FT.map(([k, fa, en, ta]) => {
      const v = k === 'phones' ? (f.phones || []).join('\n') : (f[k] || ''), ltr = /En$|email|phones|telegram|instagram|linkedin|whatsapp/.test(k) ? 'dir="ltr"' : '', lb = `<label class="block font-semibold mb-1">${lang === 'fa' ? fa : en}</label>`;
      return ta ? `<div class="${k.startsWith('seo') ? 'sm:col-span-2' : ''}">${lb}<textarea data-ft="${k}" rows="${k === 'phones' ? 3 : 4}" class="${inp}" ${ltr}>${esc(v)}</textarea></div>` : `<div>${lb}<input data-ft="${k}" class="${inp}" ${ltr} value="${esc(v)}"></div>`;
    }).join('')}</div><p id="err" class="text-red-600 min-h-6 mt-2"></p><button class="${btn}">${t('save')}</button></form>`),
    seo: () => $.when(api('GET', '/api/admin/seo'), api('GET', '/api/admin/seo/audit')).then((a, b) => { seoCfg = a[0]; prd = (a[0].redirects || []).map(x => ({ ...x })); return seoView(b[0]); }),
    blog: () => $.when(api('GET', '/api/admin/posts'), api('GET', '/api/admin/pcomments')).then((a, b) => {
      const L = a[0];
      const list = L.map(p => `<div class="${box} flex flex-wrap items-center gap-3 mb-3">${p.cover ? `<img src="${esc(p.cover)}" alt="" class="w-24 h-16 rounded-xl object-cover">` : '<div class="w-24 h-16 rounded-xl grid place-items-center text-2xl" style="background:#efe9ff">📝</div>'}
        <div class="flex-1 min-w-[160px]"><b>${esc(p.title)}</b><div class="text-sm text-slate-500">${date(p.date)} · <span class="${p.status === 'published' ? 'text-emerald-600' : 'text-amber-600'} font-semibold">${t(p.status)}</span></div></div>
        ${p.status === 'published' ? `<a href="${esc(p.path)}" target="_blank" rel="noopener" class="border rounded-lg px-3 py-1">${t('viewLive')}</a>` : ''}<button data-epost="${p.id}" class="border rounded-lg px-3 py-1">${t('edit')}</button><button data-dpost="${p.id}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button></div>`).join('');
      return `<div class="flex justify-between items-center mb-4"><h2 class="text-xl font-extrabold">${t('blog')}</h2><button id="newPost" class="${btn}">${t('addPost')}</button></div>${editPost !== null ? postForm(editPost === 0 ? null : L.find(x => x.id === editPost)) : ''}${list || `<p class="${box}">${t('none')}</p>`}
        <h3 class="text-lg font-extrabold mt-8 mb-3">${t('pcomments')}</h3>` + table([t('blog'), t('customer'), t('comment'), t('date'), ''], b[0].map(c => [esc(c.post), esc(c.name) + `<br><span dir="ltr" class="text-slate-500">${esc(c.phone)}</span>`, `<span class="whitespace-pre-line">${esc(c.text)}</span>`, date(c.date), `<button data-dpc="${esc(c.pid)}|${esc(c.id)}" class="border border-red-300 text-red-600 rounded-lg px-3 py-1">${t('del')}</button>`]));
    }),
    security: () => api('GET', '/api/admin/security').then(s => {
      const row = (ok, good, bad) => `<div class="${box} !p-3 mb-2 flex items-start gap-3 ${ok ? 'bg-emerald-50' : 'bg-amber-50'}"><span class="text-xl">${ok ? '✅' : '⚠️'}</span><span>${t(ok ? good : bad)}</span></div>`;
      return `<h2 class="text-xl font-extrabold mb-1">${t('sec_title')}</h2><p class="text-sm text-slate-500 mb-4">${t('sec_hint')}</p>${row(!s.defaultAdminPass, 'sec_pass_ok', 'sec_pass_bad')}${row(s.https, 'sec_https_ok', 'sec_https_bad')}${row(s.secretFromEnv, 'sec_key_ok', 'sec_key_bad')}${row(s.production, 'sec_prod_ok', 'sec_prod_bad')}${row(s.cdn, 'sec_cdn_ok', 'sec_cdn_bad')}
        <div class="${box} mt-4"><b>${t('sec_auto')}</b><ul class="list-disc ps-5 mt-2 space-y-1 text-sm">${[1, 2, 3, 4, 5, 6, 7].map(i => `<li>✅ ${t('sec_a' + i)}</li>`).join('')}</ul><p class="text-sm text-slate-500 mt-3">${t('sec_users')}: <b>${num(s.users)}</b></p></div>`;
    }),
    users: () => api('GET', '/api/admin/users').then(U => table([t('name'), t('phone'), t('city'), t('address'), t('post'), t('cnt')],
      U.map(u => [`<b>${esc(u.firstName)} ${esc(u.lastName)}</b>`, `<span dir="ltr">${esc(u.phone)}</span>`, esc(u.city), esc(u.address), esc(u.postalCode), num(u.orders)])))
  };

  function draw() {
    $('html').attr({ lang, dir: lang === 'fa' ? 'rtl' : 'ltr' });
    if (!tk) return $('#root').html(loginView());
    $.when(api('GET', '/api/categories'), api('GET', '/api/brands')).then((c, b) => { cats = c[0]; brandList = b[0].map(x => x.name); return tabs[tab](); }).done(html => { $('#root').html(shell(html)); $('[data-seobox]').each(function () { updSeo($(this)); }); }).fail(fail);
  }

  // ---------- events ----------
  $(document)
    .on('click', '#lang', () => { lang = lang === 'fa' ? 'en' : 'fa'; localStorage.alang = lang; draw(); })
    .on('submit', '#lf', e => {
      e.preventDefault();
      api('POST', '/api/admin/login', { username: $('#u').val(), password: $('#p').val() })
        .done(r => { tk = sessionStorage.atk = r.token; draw(); }).fail(x => $('#err').text(t(errKey(x))));
    })
    .on('click', '#out', () => { api('POST', '/api/admin/logout').always(() => { tk = null; sessionStorage.removeItem('atk'); draw(); }); })
    .on('click', '[data-tab]', function () { tab = $(this).data('tab'); editing = editCat = editBan = editOff = editPost = null; draw(); })
    .on('click', '#new', () => { editing = 0; draw(); })
    .on('click', '[data-edit]', function () { editing = Number($(this).data('edit')); draw(); window.scrollTo(0, 0); })
    .on('click', '#cancel', () => { editing = editCat = editBan = editOff = editPost = null; draw(); })
    .on('click', '[data-del]', function () {
      if (!confirm(t('sure'))) return;
      api('DELETE', '/api/admin/products/' + $(this).data('del')).done(() => { toast(t('deleted')); draw(); }).fail(fail);
    })
    .on('submit', '#pf', e => { e.preventDefault(); const b = productBody(); if (editing) saveProduct(b); else showPv(productPreview(b), t('pvConfirmNew'), () => saveProduct(b)); })
    .on('change', '[data-status]', function () {
      api('PUT', '/api/admin/orders/' + $(this).data('status'), { status: $(this).val() }).done(() => { toast(t('saved')); draw(); }).fail(fail);
    });

  $(document)
    .on('click', '#newCat', () => { editCat = 0; draw(); })
    .on('click', '[data-ecat]', function () { editCat = $(this).attr('data-ecat'); draw(); window.scrollTo(0, 0); })
    .on('click', '[data-dcat]', function () { if (!confirm(t('sureCat'))) return; api('DELETE', '/api/admin/categories/' + $(this).attr('data-dcat')).done(() => { toast(t('deleted')); draw(); }).fail(fail); })
    .on('submit', '#cf', e => {
      e.preventDefault();
      api(editCat ? 'PUT' : 'POST', '/api/admin/categories' + (editCat ? '/' + editCat : ''), { fa: $('#cfa').val(), en: $('#cen').val(), icon: $('#cic').val(), parent: $('#cpar').val() || null, slug: $('#cslug').val(), seoText: $('#cseotext').val(), seoTitle: seoVals('c').title, seoDesc: seoVals('c').desc, noindex: seoVals('c').noindex })
        .done(() => { editCat = null; toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
    })
    .on('click', '#newBan', () => { editBan = 0; draw(); })
    .on('click', '[data-eban]', function () { editBan = $(this).attr('data-eban'); draw(); window.scrollTo(0, 0); })
    .on('click', '[data-dban]', function () { if (!confirm(t('sureBan'))) return; api('DELETE', '/api/admin/banners/' + $(this).attr('data-dban')).done(() => { toast(t('deleted')); draw(); }).fail(fail); })
    .on('click', '[data-bmove]', function () { api('POST', '/api/admin/banners/' + $(this).attr('data-bmove') + '/move', { dir: Number($(this).attr('data-dir')) }).done(draw).fail(fail); })
    .on('click', '#addslide', () => { if (pslides.length < 10) { pslides.push(newSlide()); $('#slides').html(slideRows()); } })
    .on('click', '[data-rmslide]', function () { if (pslides.length > 1) { pslides.splice(Number($(this).attr('data-rmslide')), 1); $('#slides').html(slideRows()); } })
    .on('click', '[data-mvslide]', function () {
      const i = Number($(this).attr('data-mvslide')), j = i + Number($(this).attr('data-dir'));
      if (j >= 0 && j < pslides.length) { [pslides[i], pslides[j]] = [pslides[j], pslides[i]]; $('#slides').html(slideRows()); }
    })
    .on('input change', '[data-sl]', function () { const i = Number($(this).closest('[data-slide]').attr('data-slide')); pslides[i][$(this).attr('data-sl')] = $(this).val(); })
    .on('change', '[data-sfile]', async function () {
      const f = this.files[0], i = Number($(this).closest('[data-slide]').attr('data-slide')); if (!f) return;
      try { pslides[i].image = await uploadImage(f, 1800); $('#slides').html(slideRows()); toast(t('saved')); } catch (e) { toast(t('e_server')); }
    })
    .on('submit', '#bf', e => { e.preventDefault(); const b = bannerBody(); if (editBan) saveBanner(b); else showPv(bannerPreview(b), t('pvConfirmNew'), () => saveBanner(b)); });
  $(document)
    .on('change', '#pfile', async function () {
      for (const f of this.files) { if (pimgs.length >= 8) break; try { pimgs.push(await uploadImage(f, 1200)); $('#pthumbs').html(thumbsHtml()); } catch (e) { toast(t('e_server')); } }
      this.value = '';
    })
    .on('click', '[data-rmimg]', function () { pimgs.splice(Number($(this).attr('data-rmimg')), 1); $('#pthumbs').html(thumbsHtml()); });

  $(document)
    .on('click', '#addspec', () => { pspecs.push({ tfa: '', vfa: '', ten: '', ven: '' }); $('#specs').html(specRows()); })
    .on('click', '[data-rmspec]', function () { pspecs.splice(Number($(this).attr('data-rmspec')), 1); $('#specs').html(specRows()); })
    .on('input', '[data-sf]', function () { const i = Number($(this).closest('[data-srow]').attr('data-srow')); pspecs[i][$(this).attr('data-sf')] = $(this).val(); })
    .on('click', '#newOff', () => { editOff = 0; draw(); })
    .on('click', '[data-eoff]', function () { editOff = $(this).attr('data-eoff'); draw(); window.scrollTo(0, 0); })
    .on('click', '[data-doff]', function () { if (!confirm(t('sureOff'))) return; api('DELETE', '/api/admin/offers/' + $(this).attr('data-doff')).done(() => { toast(t('deleted')); draw(); }).fail(fail); })
    .on('click', '[data-omove]', function () { api('POST', '/api/admin/offers/' + $(this).attr('data-omove') + '/move', { dir: Number($(this).attr('data-dir')) }).done(() => draw()).fail(fail); })
    .on('submit', '#of', e => {
      e.preventDefault();
      const body = { tfa: $('#otfa').val(), ten: $('#oten').val(), percent: $('#opct').val(), end: $('#oend').val() ? new Date($('#oend').val()).toISOString() : '', bg: $('#obg').val(), color: $('#otx').val(), active: $('#oact').is(':checked'), products: $('[data-op]:checked').map((_, el) => Number($(el).attr('data-op'))).get() };
      api(editOff ? 'PUT' : 'POST', '/api/admin/offers' + (editOff ? '/' + editOff : ''), body)
        .done(() => { editOff = null; toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
    });

  $(document)
    .on('click', '[data-drev]', function () { if (!confirm(t('sureRev'))) return; const [pid, phone] = $(this).attr('data-drev').split('|'); api('DELETE', '/api/admin/reviews/' + pid + '/' + phone).done(() => { toast(t('deleted')); draw(); }).fail(fail); })
    .on('click', '#aadd', () => { if (pann.items.length < 10) { pann.items.push({ fa: '', en: '' }); $('#arows').html(annRows()); } })
    .on('click', '[data-arm]', function () { pann.items.splice(Number($(this).attr('data-arm')), 1); $('#arows').html(annRows()); })
    .on('click', '[data-armv]', function () {
      const i = Number($(this).attr('data-armv')), j = i + Number($(this).attr('data-dir'));
      if (j >= 0 && j < pann.items.length) { [pann.items[i], pann.items[j]] = [pann.items[j], pann.items[i]]; $('#arows').html(annRows()); }
    })
    .on('input', '[data-af]', function () { const i = Number($(this).closest('[data-arow]').attr('data-arow')); pann.items[i][$(this).attr('data-af')] = $(this).val(); })
    .on('input', '#abg, #atx', () => $('#apv').css({ background: $('#abg').val(), color: $('#atx').val() }))
    .on('submit', '#af', e => {
      e.preventDefault();
      api('PUT', '/api/admin/announce', { items: pann.items, bg: $('#abg').val(), color: $('#atx').val(), interval: $('#aint').val(), active: $('#aact').is(':checked') })
        .done(() => { toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
    });

  $(document)
    .on('change', '#fbrand', function () { fBrand = $(this).val(); draw(); })
    .on('click', '#obrandadd', () => { const b = $('#obrandsel').val(); if (b) allP.filter(p => p.brand === b).forEach(p => $('[data-op="' + p.id + '"]').prop('checked', true)); })
    .on('submit', '#ff', e => {
      e.preventDefault(); const body = {}; $('[data-ft]').each(function () { body[$(this).attr('data-ft')] = $(this).val(); });
      api('PUT', '/api/admin/footer', body).done(() => { toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
    });

  $(document)
    .on('click', '[data-stab]', function () { seoTab = $(this).attr('data-stab'); draw(); })
    .on('click', '[data-fix]', function () {
      const [k, id] = $(this).attr('data-fix').split(':'); editing = editCat = editBan = editOff = editPost = null;
      if (k === 'product') { tab = 'products'; editing = Number(id); } else if (k === 'category') { tab = 'categories'; editCat = id; } else { tab = 'seo'; seoTab = k === 'page' ? 'pages' : 'general'; }
      draw(); window.scrollTo(0, 0);
    })
    .on('input', '[data-seo], #fa, #df, #cfa, #ptitle, #pexcerpt', () => $('[data-seobox]').each(function () { updSeo($(this)); }))
    .on('change', '#ogfile', async function () {
      const f = this.files[0]; if (!f) return;
      try { $('#ogimg').val(await uploadImage(f, 1200)); toast(t('saved')); } catch (e) { toast(t('e_server')); }
    })
    .on('submit', '#sg', e => {
      e.preventDefault();
      api('PUT', '/api/admin/seo', { general: { baseUrl: $('#gbase').val(), siteName: $('#gsite').val(), titleTpl: $('#gtpl').val(), defKeywords: $('#gkw').val(), defDesc: $('#gdesc').val(), ogImage: $('#ogimg').val(), gsc: $('#ggsc').val(), bing: $('#gbing').val(), ga: $('#gga').val(), gtm: $('#ggtm').val(), robotsBlock: $('#gblock').is(':checked') } })
        .done(() => { toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
    })
    .on('submit', '#sp', e => {
      e.preventDefault();
      api('PUT', '/api/admin/seo', { pages: { home: seoVals('pg-home'), products: seoVals('pg-products'), blog: seoVals('pg-blog'), about: seoVals('pg-about') } }).done(() => { toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x))));
    })
    .on('click', '#radd', () => { prd.push({ from: '', to: '' }); $('#rrows').html(rdrRows()); })
    .on('click', '[data-rrm]', function () { prd.splice(Number($(this).attr('data-rrm')), 1); $('#rrows').html(rdrRows()); })
    .on('input', '[data-rf]', function () { const i = Number($(this).closest('[data-rrow]').attr('data-rrow')); prd[i][$(this).attr('data-rf')] = $(this).val(); })
    .on('submit', '#sr', e => { e.preventDefault(); api('PUT', '/api/admin/seo', { redirects: prd }).done(() => { toast(t('saved')); draw(); }).fail(x => $('#err').text(t(errKey(x)))); });

  $(document)
    .on('click', '#pvx, #pvback', () => $('#pvm').remove())
    .on('keydown', e => { if (e.key === 'Escape') $('#pvm').remove(); })
    .on('click', '#pvok', function () { $(this).prop('disabled', true); const r = pvOk && pvOk(); if (r && r.always) r.always(() => $('#pvm').remove()); else $('#pvm').remove(); })
    .on('click', '#pvbtn', () => { const b = productBody(); showPv(productPreview(b), editing ? t('pvConfirmSave') : t('pvConfirmNew'), () => saveProduct(b)); })
    .on('click', '#banpv', () => { const b = bannerBody(); showPv(bannerPreview(b), editBan ? t('pvConfirmSave') : t('pvConfirmNew'), () => saveBanner(b)); })
    .on('click', '#newPost', () => { editPost = 0; draw(); })
    .on('click', '[data-epost]', function () { editPost = Number($(this).attr('data-epost')); draw(); window.scrollTo(0, 0); })
    .on('click', '[data-dpost]', function () { if (!confirm(t('sureP'))) return; api('DELETE', '/api/admin/posts/' + $(this).attr('data-dpost')).done(() => { toast(t('deleted')); draw(); }).fail(fail); })
    .on('click', '[data-dpc]', function () { if (!confirm(t('sureC'))) return; const [pid, cid] = $(this).attr('data-dpc').split('|'); api('DELETE', '/api/admin/pcomments/' + pid + '/' + cid).done(() => { toast(t('deleted')); draw(); }).fail(fail); })
    .on('change', '#pcoverf', async function () { const f = this.files[0]; if (!f) return; try { const u = await uploadImage(f, 1600); $('#pcover').val(u); $('#pcoverpv').html(`<img src="${esc(u)}" alt="" class="h-24 mt-2 rounded-lg">`); } catch (e) { toast(t('e_server')); } this.value = ''; })
    .on('change', '#pbimg', async function () {
      const f = this.files[0]; if (!f) return;
      try { const u = await uploadImage(f, 1400), ta = $('#pbody')[0], pos = ta.selectionStart == null ? ta.value.length : ta.selectionStart, ins = `\n\n![${$('#palt2').val() || ''}](${u})\n\n`; ta.value = ta.value.slice(0, pos) + ins + ta.value.slice(pos); } catch (e) { toast(t('e_server')); }
      this.value = '';
    })
    .on('submit', '#pof', e => { e.preventDefault(); const b = postBody(); if (editPost) savePost(b); else previewPost(b, t('pvConfirmNew')); })
    .on('click', '#postpv', () => previewPost(postBody(), editPost ? t('pvConfirmSave') : t('pvConfirmNew')));

  draw();
});
