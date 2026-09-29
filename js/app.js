/* SPA router + pages for Цветущая кондитерская */
(function () {
  const app = document.getElementById("app");
  const cartCountEl = document.getElementById("cart-count");
  const nav = document.getElementById("main-nav");
  const navToggle = document.getElementById("nav-toggle");
  const yearEl = document.getElementById("year");
  const header = document.getElementById("site-header");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  let toastTimer = null;

  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function updateCartBadge() {
    const n = Store.cartCount();
    if (n > 0) {
      cartCountEl.hidden = false;
      cartCountEl.textContent = String(n);
    } else {
      cartCountEl.hidden = true;
    }
  }

  function setActiveNav(path) {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const route = (a.getAttribute("href") || "#/").replace("#", "") || "/";
      let on = false;
      if (route === "/" && path === "/") on = true;
      else if (route === "/catalog" && (path === "/catalog" || path.startsWith("/product"))) on = true;
      else if (route !== "/" && route !== "/catalog" && path.startsWith(route)) on = true;
      a.classList.toggle("active", on);
    });
  }

  function parseRoute() {
    const hash = location.hash.replace(/^#/, "") || "/";
    const [pathPart, query = ""] = hash.split("?");
    const path = pathPart || "/";
    const params = Object.fromEntries(new URLSearchParams(query));
    const productMatch = path.match(/^\/product\/([^/]+)/);
    if (productMatch) return { name: "product", id: decodeURIComponent(productMatch[1]), params };
    if (path === "/" || path === "") return { name: "home", params };
    if (path === "/catalog") return { name: "catalog", params };
    if (path === "/cart") return { name: "cart", params };
    if (path === "/delivery") return { name: "delivery", params };
    if (path === "/privacy") return { name: "privacy", params };
    if (path === "/offer") return { name: "offer", params };
    if (path === "/admin") return { name: "admin", params };
    return { name: "home", params };
  }

  function productMedia(p, className) {
    if (p.image) {
      return `<img class="${className}" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" />`;
    }
    return `<span class="bloom-emoji" aria-hidden="true">${p.emoji || "❀"}</span>`;
  }

  function bloomTile(p) {
    return `
      <a class="bloom-tile" href="#/product/${p.id}">
        <div class="bloom-visual ${p.image ? "has-photo" : p.tone || "tone-rose"}">
          ${productMedia(p, "bloom-photo")}
        </div>
        <div class="bloom-meta">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.short)}</p>
          <span class="bloom-price">${Store.formatPrice(p.price)}</span>
        </div>
      </a>`;
  }

  function catalogItem(p) {
    return `
      <a class="catalog-item" href="#/product/${p.id}">
        <div class="catalog-visual ${p.image ? "has-photo" : p.tone || "tone-rose"}">
          ${p.tag ? `<span class="catalog-tag">${escapeHtml(p.tag)}</span>` : ""}
          ${productMedia(p, "bloom-photo")}
        </div>
        <div class="catalog-body">
          <h2>${escapeHtml(p.name)}</h2>
          <p>${escapeHtml(p.short)}</p>
          <span class="bloom-price">${Store.formatPrice(p.price)}</span>
        </div>
      </a>`;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ——— Pages ——— */

  function renderHome() {
    const featured = Store.getActiveProducts().filter((p) => p.featured).slice(0, 4);
    return `
      <section class="hero" aria-label="Главная">
        <div class="hero-stage">
          <div class="hero-copy">
            <p class="hero-brand">Цветущая<br>кондитерская</p>
            <h1 class="hero-title">Сладкие цветы, которые можно съесть</h1>
            <p class="hero-text">Сахарные цветы, оформление свадебных тортов композициями из сахарных цветов.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#/catalog">Смотреть каталог</a>
              <a class="btn btn-ghost" href="#/delivery">Как доставляем</a>
            </div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="hero-canvas">
              <span class="hero-petal"></span>
              <span class="hero-petal"></span>
              <span class="hero-petal"></span>
              <p class="hero-caption">Ручная лепка. Летний вкус. Романтика в каждой коробке.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="promise wrap">
        <p class="eyebrow">Почему мы</p>
        <h2 class="display" style="font-size:clamp(1.6rem,3.5vw,2.2rem)">Не витрина — сад сладостей</h2>
        <div class="promise-grid">
          <article class="promise-item">
            <span class="promise-num">01</span>
            <h3>Съедобные цветы</h3>
            <p>Сахарные цветы ручной лепки — для свадебных тортов и изысканных композиций.</p>
          </article>
          <article class="promise-item">
            <span class="promise-num">02</span>
            <h3>Под ваш повод</h3>
            <p>Свидание, день рождения или просто «спасибо» — соберём набор под настроение.</p>
          </article>
          <article class="promise-item">
            <span class="promise-num">03</span>
            <h3>Нефтекамск рядом</h3>
            <p>Доставляем по городу в день заказа при оформлении до 14:00.</p>
          </article>
        </div>
      </section>

      <section class="featured wrap">
        <div class="featured-head">
          <div>
            <p class="eyebrow">Из сада</p>
            <h2 class="display" style="font-size:clamp(1.6rem,3.5vw,2.2rem)">Сегодня расцвело</h2>
          </div>
          <a class="btn btn-ghost btn-sm" href="#/catalog">Весь каталог</a>
        </div>
        <div class="bloom-row">
          ${featured.map(bloomTile).join("") || "<p class='empty-state'>Скоро появятся новые цветы</p>"}
        </div>
      </section>

      <section class="cta-band">
        <h2>Подарите сад, который можно разделить за чаем</h2>
        <p>Оформите заказ онлайн — мы соберём букет и привезём по Нефтекамску.</p>
        <a class="btn btn-primary" href="#/catalog">Выбрать цветы</a>
      </section>`;
  }

  function renderCatalog(params) {
    const category = params.cat || "Все";
    const products = Store.getActiveProducts();
    const cats = ["Все", ...new Set(products.map((p) => p.category))];
    const filtered =
      category === "Все" ? products : products.filter((p) => p.category === category);

    return `
      <div class="wrap page-head">
        <p class="eyebrow">Каталог</p>
        <h1>Съедобный сад</h1>
        <p class="lead">Цветы, бутоны и наборы — выбирайте как букет, а не как список товаров.</p>
        <div class="filters" role="tablist" aria-label="Категории">
          ${cats
            .map(
              (c) => `
            <button type="button" class="filter-chip ${c === category ? "active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
            )
            .join("")}
        </div>
      </div>
      <div class="wrap catalog-mosaic">
        ${
          filtered.length
            ? filtered.map(catalogItem).join("")
            : `<p class="empty-state">В этой категории пока тихо — загляните позже.</p>`
        }
      </div>`;
  }

  function renderProduct(id) {
    const p = Store.getProduct(id);
    if (!p || p.active === false) {
      return `
        <div class="wrap page-head">
          <h1>Цветок не найден</h1>
          <p class="lead">Возможно, он уже ушёл к другому гостю.</p>
          <a class="btn btn-primary" href="#/catalog" style="margin-top:1.5rem">В каталог</a>
        </div>`;
    }

    return `
      <div class="wrap product-layout">
        <div class="product-stage ${p.image ? "has-photo" : p.tone || "tone-rose"}">
          ${productMedia(p, "product-photo")}
        </div>
        <div class="product-info">
          <p class="eyebrow">${escapeHtml(p.category)}${p.tag ? " · " + escapeHtml(p.tag) : ""}</p>
          <h1>${escapeHtml(p.name)}</h1>
          <p class="product-price">${Store.formatPrice(p.price)}</p>
          <p class="product-desc">${escapeHtml(p.description)}</p>
          <ul class="product-facts">
            ${(p.facts || []).map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
          </ul>
          <div class="qty-row">
            <div class="qty-control" data-qty-wrap>
              <button type="button" data-qty-minus aria-label="Меньше">−</button>
              <span data-qty>1</span>
              <button type="button" data-qty-plus aria-label="Больше">+</button>
            </div>
            <button type="button" class="btn btn-primary" data-add-cart="${p.id}">В корзину</button>
          </div>
          <a class="btn btn-ghost btn-sm" href="#/catalog">← К каталогу</a>
        </div>
      </div>`;
  }

  function renderCart() {
    const cart = Store.getCart();
    if (!cart.length) {
      return `
        <div class="wrap cart-empty">
          <p class="eyebrow">Корзина</p>
          <h1 class="display" style="font-size:2rem">Пока пусто</h1>
          <p class="lead" style="margin:0.75rem auto 1.5rem">Сад ждёт — выберите цветы в каталоге.</p>
          <a class="btn btn-primary" href="#/catalog">Открыть каталог</a>
        </div>`;
    }

    const lines = cart
      .map((line) => {
        const p = Store.getProduct(line.id);
        if (!p) return "";
        return `
          <article class="cart-line" data-line="${p.id}">
            <div class="cart-thumb ${p.image ? "has-photo" : p.tone || "tone-rose"}">${
              p.image
                ? `<img src="${escapeHtml(p.image)}" alt="" />`
                : p.emoji || "❀"
            }</div>
            <div>
              <h3>${escapeHtml(p.name)}</h3>
              <p class="muted">${Store.formatPrice(p.price)} · ${escapeHtml(p.category)}</p>
              <div class="qty-control" style="margin-top:0.6rem" data-cart-qty="${p.id}">
                <button type="button" data-cart-minus="${p.id}" aria-label="Меньше">−</button>
                <span>${line.qty}</span>
                <button type="button" data-cart-plus="${p.id}" aria-label="Больше">+</button>
              </div>
            </div>
            <div class="cart-line-actions">
              <strong>${Store.formatPrice(p.price * line.qty)}</strong>
              <button type="button" class="cart-remove" data-cart-remove="${p.id}">Убрать</button>
            </div>
          </article>`;
      })
      .join("");

    return `
      <div class="wrap page-head">
        <p class="eyebrow">Корзина</p>
        <h1>Ваш букет</h1>
      </div>
      <div class="wrap cart-layout">
        <div class="cart-list">${lines}</div>
        <aside class="cart-side">
          <h2>Оформление</h2>
          <form id="order-form">
            <div class="field">
              <label for="name">Имя</label>
              <input id="name" name="name" required autocomplete="name" placeholder="Как к вам обращаться" />
            </div>
            <div class="field">
              <label for="phone">Телефон</label>
              <input id="phone" name="phone" type="tel" required autocomplete="tel" placeholder="+7…" />
            </div>
            <div class="field">
              <label for="address">Адрес доставки</label>
              <input id="address" name="address" required placeholder="Нефтекамск, улица…" />
            </div>
            <div class="field">
              <label for="comment">Комментарий</label>
              <textarea id="comment" name="comment" placeholder="Повод, время, пожелания"></textarea>
            </div>
            <div class="cart-total">
              <span>Итого</span>
              <span>${Store.formatPrice(Store.cartTotal())}</span>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%">Отправить заявку</button>
            <p class="muted" style="font-size:0.8rem;margin:0.85rem 0 0;color:var(--ink-soft)">
              Нажимая кнопку, вы соглашаетесь с <a href="#/offer">офертой</a> и <a href="#/privacy">политикой</a>.
            </p>
          </form>
        </aside>
      </div>`;
  }

  function renderDelivery() {
    return `
      <div class="wrap prose page-head">
        <p class="eyebrow">Доставка</p>
        <h1>Как мы привозим цветы</h1>
        <p>Работаем по Нефтекамску. Сладкие букеты бережно упаковываем и доставляем в день заказа или к согласованному времени.</p>

        <div class="delivery-grid">
          <div class="delivery-block">
            <h3>По городу</h3>
            <p>Доставка по Нефтекамску — от 200 ₽. Бесплатно при заказе от 3 000 ₽.</p>
          </div>
          <div class="delivery-block">
            <h3>Сроки</h3>
            <p>Заказы до 14:00 — доставка в тот же день. После 14:00 — на следующий день.</p>
          </div>
          <div class="delivery-block">
            <h3>Самовывоз</h3>
            <p>Можно забрать по договорённости. Адрес и время уточним после заявки.</p>
          </div>
          <div class="delivery-block">
            <h3>Оплата</h3>
            <p>Наличными или переводом при получении. Предоплата — для крупных наборов.</p>
          </div>
        </div>

        <h2>Контакты</h2>
        <p>Телефон: <a href="tel:+79991234567">+7 (999) 123-45-67</a><br>
        Telegram: <a href="https://t.me/cvetushaya" target="_blank" rel="noopener">@cvetushaya</a><br>
        Город: Нефтекамск</p>
        <p style="margin-top:2rem"><a class="btn btn-primary" href="#/catalog">Выбрать в каталоге</a></p>
      </div>`;
  }

  function renderPrivacy() {
    return `
      <div class="wrap prose page-head">
        <p class="eyebrow">Документы</p>
        <h1>Политика конфиденциальности</h1>
        <p>Настоящая политика определяет порядок обработки персональных данных пользователей сайта «Цветущая кондитерская» (Нефтекамск).</p>

        <h2>1. Какие данные мы получаем</h2>
        <p>Имя, номер телефона, адрес доставки и комментарий к заказу — только то, что вы указываете при оформлении заявки.</p>

        <h2>2. Для чего используем</h2>
        <ul>
          <li>связь по заказу и доставке;</li>
          <li>уточнение деталей букета;</li>
          <li>исполнение договора купли-продажи.</li>
        </ul>

        <h2>3. Хранение и защита</h2>
        <p>Данные хранятся столько, сколько нужно для исполнения заказа и требований закона. Мы не передаём их третьим лицам для рекламы без вашего согласия.</p>

        <h2>4. Ваши права</h2>
        <p>Вы можете запросить уточнение, блокирование или удаление своих данных, написав нам на телефон или в Telegram, указанные на сайте.</p>

        <h2>5. Контакты оператора</h2>
        <p>«Цветущая кондитерская», г. Нефтекамск<br>
        Тел.: +7 (999) 123-45-67</p>
        <p><em>Дата публикации: 27 сентября 2026 г.</em></p>
      </div>`;
  }

  function renderOffer() {
    return `
      <div class="wrap prose page-head">
        <p class="eyebrow">Документы</p>
        <h1>Публичная оферта</h1>
        <p>Настоящий документ является официальным предложением интернет-магазина «Цветущая кондитерская» (г. Нефтекамск) заключить договор розничной купли-продажи съедобных кондитерских изделий.</p>

        <h2>1. Предмет оферты</h2>
        <p>Продавец предлагает купить сладкие съедобные цветы, бутоны и наборы, представленные в каталоге сайта, на условиях этой оферты.</p>

        <h2>2. Оформление заказа</h2>
        <p>Заявка на сайте — это акцепт оферты. Заказ считается принятым после подтверждения продавцом по телефону или в мессенджере.</p>

        <h2>3. Цена и оплата</h2>
        <p>Цены указаны в рублях. Оплата — при получении или по договорённости. Стоимость доставки рассчитывается отдельно согласно разделу «Доставка».</p>

        <h2>4. Доставка и получение</h2>
        <p>Доставка осуществляется по г. Нефтекамск. Сроки и условия — на странице «Доставка». Риск случайной гибели товара переходит к покупателю с момента передачи.</p>

        <h2>5. Качество и возврат</h2>
        <p>Продукция имеет ограниченный срок годности. Претензии по качеству принимаются в день получения при сохранении товарного вида. Возврат продовольственных товаров надлежащего качества не осуществляется в случаях, предусмотренных законодательством РФ.</p>

        <h2>6. Реквизиты</h2>
        <p>«Цветущая кондитерская»<br>
        г. Нефтекамск<br>
        Тел.: +7 (999) 123-45-67</p>
        <p><em>Оферта действует с 27 сентября 2026 г.</em></p>
      </div>`;
  }

  /* ——— Admin ——— */

  function renderAdmin() {
    if (!Store.isAdminAuthed()) {
      return `
        <div class="wrap admin-shell">
          <div class="page-head" style="text-align:center">
            <p class="eyebrow">Админка</p>
            <h1>Вход для кондитера</h1>
          </div>
          <form class="admin-login" id="admin-login">
            <div class="field">
              <label for="admin-pass">Пароль</label>
              <input id="admin-pass" type="password" required autocomplete="current-password" />
            </div>
            <button type="submit" class="btn btn-sage" style="width:100%">Войти</button>
            <p style="font-size:0.8rem;color:var(--ink-soft);margin:1rem 0 0;text-align:center">Пароль по умолчанию: leila2026</p>
          </form>
        </div>`;
    }

    const orders = Store.getOrders();
    const products = Store.getProducts();
    const tab = (location.hash.includes("tab=products") ? "products" : "orders");

    return `
      <div class="wrap admin-shell">
        <div class="page-head" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:1rem">
          <div>
            <p class="eyebrow">Админка</p>
            <h1>Цветущая кондитерская</h1>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" id="admin-logout">Выйти</button>
        </div>

        <div class="admin-tabs">
          <button type="button" class="admin-tab ${tab === "orders" ? "active" : ""}" data-admin-tab="orders">Заявки (${orders.length})</button>
          <button type="button" class="admin-tab ${tab === "products" ? "active" : ""}" data-admin-tab="products">Товары (${products.length})</button>
        </div>

        <section class="admin-panel ${tab === "orders" ? "active" : ""}" id="panel-orders" data-panel="orders">
          ${
            orders.length
              ? `<div class="admin-table-wrap"><table class="admin-table">
                  <thead><tr><th>Дата</th><th>Клиент</th><th>Состав</th><th>Сумма</th><th>Статус</th><th></th></tr></thead>
                  <tbody>
                    ${orders
                      .map((o) => {
                        const items = (o.items || [])
                          .map((i) => `${escapeHtml(i.name)} × ${i.qty}`)
                          .join(", ");
                        return `<tr>
                          <td>${escapeHtml(o.createdAt)}</td>
                          <td>
                            <strong>${escapeHtml(o.name)}</strong><br>
                            <a href="tel:${escapeHtml(o.phone)}">${escapeHtml(o.phone)}</a><br>
                            <span style="font-size:0.85rem;color:var(--ink-soft)">${escapeHtml(o.address)}</span>
                            ${o.comment ? `<p class="order-items">${escapeHtml(o.comment)}</p>` : ""}
                          </td>
                          <td><p class="order-items">${items}</p></td>
                          <td>${Store.formatPrice(o.total)}</td>
                          <td><span class="status-pill ${o.status === "done" ? "done" : "new"}">${o.status === "done" ? "Готово" : "Новая"}</span></td>
                          <td class="admin-actions">
                            ${
                              o.status !== "done"
                                ? `<button type="button" class="btn btn-sage btn-sm" data-order-done="${o.id}">Готово</button>`
                                : ""
                            }
                          </td>
                        </tr>`;
                      })
                      .join("")}
                  </tbody>
                </table></div>`
              : `<p class="empty-state">Заявок пока нет — они появятся после оформления заказа на сайте.</p>`
          }
        </section>

        <section class="admin-panel ${tab === "products" ? "active" : ""}" id="panel-products" data-panel="products">
          <div class="admin-toolbar">
            <p class="lead" style="margin:0">Добавляйте и редактируйте цветы каталога.</p>
            <button type="button" class="btn btn-primary btn-sm" id="product-new">+ Новый товар</button>
          </div>

          <form class="admin-form" id="product-form" hidden>
            <h3 id="product-form-title">Новый товар</h3>
            <input type="hidden" name="id" id="pf-id" />
            <div class="form-row">
              <div class="field"><label>Название</label><input name="name" id="pf-name" required /></div>
              <div class="field"><label>Категория</label>
                <select name="category" id="pf-category">
                  <option>Бутоны</option><option>Цветы</option><option>Наборы</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label>Цена, ₽</label><input name="price" id="pf-price" type="number" min="1" required /></div>
              <div class="field"><label>Фото (путь)</label><input name="image" id="pf-image" placeholder="images/name.jpg" /></div>
            </div>
            <div class="form-row">
              <div class="field"><label>Эмодзи (если нет фото)</label><input name="emoji" id="pf-emoji" maxlength="4" placeholder="🌸" /></div>
              <div class="field"><label>Оттенок</label>
                <select name="tone" id="pf-tone">
                  <option value="tone-rose">Розовый</option>
                  <option value="tone-peach">Персиковый</option>
                  <option value="tone-lilac">Сиреневый</option>
                  <option value="tone-mint">Мятный</option>
                  <option value="tone-honey">Медовый</option>
                  <option value="tone-sky">Небесный</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label>Метка</label><input name="tag" id="pf-tag" placeholder="хит, новинка…" /></div>
              <div class="field"></div>
            </div>
            <div class="field"><label>Кратко</label><input name="short" id="pf-short" required /></div>
            <div class="field"><label>Описание</label><textarea name="description" id="pf-description" required></textarea></div>
            <div class="field"><label>Факты (каждый с новой строки)</label><textarea name="facts" id="pf-facts" placeholder="Вес ~45 г&#10;Хранение 3 дня"></textarea></div>
            <div class="form-row">
              <div class="field"><label><input type="checkbox" name="featured" id="pf-featured" /> Показывать на главной</label></div>
              <div class="field"><label><input type="checkbox" name="active" id="pf-active" checked /> Активен в каталоге</label></div>
            </div>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
              <button type="submit" class="btn btn-primary">Сохранить</button>
              <button type="button" class="btn btn-ghost" id="product-form-cancel">Отмена</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th></th><th>Товар</th><th>Категория</th><th>Цена</th><th>Статус</th><th></th></tr></thead>
              <tbody>
                ${products
                  .map(
                    (p) => `<tr>
                      <td>${
                        p.image
                          ? `<img src="${escapeHtml(p.image)}" alt="" class="admin-thumb" />`
                          : `<span style="font-size:1.5rem">${p.emoji || "❀"}</span>`
                      }</td>
                      <td><strong>${escapeHtml(p.name)}</strong><br><span style="font-size:0.85rem;color:var(--ink-soft)">${escapeHtml(p.short)}</span></td>
                      <td>${escapeHtml(p.category)}</td>
                      <td>${Store.formatPrice(p.price)}</td>
                      <td>${p.active !== false ? "В каталоге" : "Скрыт"}${p.featured ? " · главная" : ""}</td>
                      <td class="admin-actions">
                        <button type="button" class="btn btn-ghost btn-sm" data-edit-product="${p.id}">Изменить</button>
                        <button type="button" class="btn btn-ghost btn-sm" data-delete-product="${p.id}">Удалить</button>
                      </td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
      </div>`;
  }

  function fillProductForm(p) {
    const form = document.getElementById("product-form");
    if (!form) return;
    form.hidden = false;
    document.getElementById("product-form-title").textContent = p ? "Редактирование" : "Новый товар";
    document.getElementById("pf-id").value = p?.id || "";
    document.getElementById("pf-name").value = p?.name || "";
    document.getElementById("pf-category").value = p?.category || "Бутоны";
    document.getElementById("pf-price").value = p?.price || "";
    document.getElementById("pf-image").value = p?.image || "";
    document.getElementById("pf-emoji").value = p?.emoji || "🌸";
    document.getElementById("pf-tone").value = p?.tone || "tone-rose";
    document.getElementById("pf-tag").value = p?.tag || "";
    document.getElementById("pf-short").value = p?.short || "";
    document.getElementById("pf-description").value = p?.description || "";
    document.getElementById("pf-facts").value = (p?.facts || []).join("\n");
    document.getElementById("pf-featured").checked = !!p?.featured;
    document.getElementById("pf-active").checked = p ? p.active !== false : true;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindPageEvents(route) {
    if (route.name === "catalog") {
      app.querySelectorAll("[data-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const cat = btn.getAttribute("data-cat");
          location.hash = cat === "Все" ? "#/catalog" : `#/catalog?cat=${encodeURIComponent(cat)}`;
        });
      });
    }

    if (route.name === "product") {
      let qty = 1;
      const qtyEl = app.querySelector("[data-qty]");
      app.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
        qty = Math.max(1, qty - 1);
        if (qtyEl) qtyEl.textContent = String(qty);
      });
      app.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
        qty += 1;
        if (qtyEl) qtyEl.textContent = String(qty);
      });
      app.querySelector("[data-add-cart]")?.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-add-cart");
        Store.addToCart(id, qty);
        toast("Добавлено в корзину");
      });
    }

    if (route.name === "cart") {
      app.querySelectorAll("[data-cart-minus]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-cart-minus");
          const line = Store.getCart().find((c) => c.id === id);
          if (line) Store.updateCartQty(id, line.qty - 1);
          render();
        });
      });
      app.querySelectorAll("[data-cart-plus]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-cart-plus");
          const line = Store.getCart().find((c) => c.id === id);
          if (line) Store.updateCartQty(id, line.qty + 1);
          render();
        });
      });
      app.querySelectorAll("[data-cart-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          Store.removeFromCart(btn.getAttribute("data-cart-remove"));
          toast("Убрано из корзины");
          render();
        });
      });

      const form = document.getElementById("order-form");
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const cart = Store.getCart();
        const items = cart
          .map((line) => {
            const p = Store.getProduct(line.id);
            if (!p) return null;
            return { id: p.id, name: p.name, price: p.price, qty: line.qty };
          })
          .filter(Boolean);

        Store.addOrder({
          id: Store.uid("ord"),
          createdAt: new Date().toLocaleString("ru-RU"),
          name: String(fd.get("name") || "").trim(),
          phone: String(fd.get("phone") || "").trim(),
          address: String(fd.get("address") || "").trim(),
          comment: String(fd.get("comment") || "").trim(),
          items,
          total: Store.cartTotal(),
          status: "new",
        });
        Store.clearCart();
        toast("Заявка принята — мы свяжемся с вами");
        location.hash = "#/";
      });
    }

    if (route.name === "admin") {
      document.getElementById("admin-login")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const pass = document.getElementById("admin-pass").value;
        if (pass === window.ADMIN_PASSWORD) {
          Store.setAdminAuthed(true);
          toast("Добро пожаловать");
          render();
        } else {
          toast("Неверный пароль");
        }
      });

      document.getElementById("admin-logout")?.addEventListener("click", () => {
        Store.setAdminAuthed(false);
        render();
      });

      app.querySelectorAll("[data-admin-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const t = btn.getAttribute("data-admin-tab");
          location.hash = t === "products" ? "#/admin?tab=products" : "#/admin";
        });
      });

      app.querySelectorAll("[data-order-done]").forEach((btn) => {
        btn.addEventListener("click", () => {
          Store.updateOrderStatus(btn.getAttribute("data-order-done"), "done");
          toast("Отмечено как готово");
          render();
        });
      });

      document.getElementById("product-new")?.addEventListener("click", () => fillProductForm(null));
      document.getElementById("product-form-cancel")?.addEventListener("click", () => {
        const form = document.getElementById("product-form");
        if (form) form.hidden = true;
      });

      app.querySelectorAll("[data-edit-product]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const p = Store.getProduct(btn.getAttribute("data-edit-product"));
          fillProductForm(p);
        });
      });

      app.querySelectorAll("[data-delete-product]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-delete-product");
          if (confirm("Удалить товар из каталога?")) {
            Store.deleteProduct(id);
            toast("Товар удалён");
            location.hash = "#/admin?tab=products";
            render();
          }
        });
      });

      document.getElementById("product-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("pf-id").value || Store.uid("p");
        const facts = document
          .getElementById("pf-facts")
          .value.split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        Store.upsertProduct({
          id,
          name: document.getElementById("pf-name").value.trim(),
          category: document.getElementById("pf-category").value,
          price: Number(document.getElementById("pf-price").value) || 0,
          image: document.getElementById("pf-image").value.trim(),
          emoji: document.getElementById("pf-emoji").value.trim() || "🌸",
          tone: document.getElementById("pf-tone").value,
          tag: document.getElementById("pf-tag").value.trim(),
          short: document.getElementById("pf-short").value.trim(),
          description: document.getElementById("pf-description").value.trim(),
          facts,
          featured: document.getElementById("pf-featured").checked,
          active: document.getElementById("pf-active").checked,
        });
        toast("Товар сохранён");
        location.hash = "#/admin?tab=products";
        render();
      });
    }
  }

  function render() {
    const route = parseRoute();
    let html = "";
    switch (route.name) {
      case "home":
        html = renderHome();
        document.title = "Цветущая кондитерская — съедобные цветы в Нефтекамске";
        break;
      case "catalog":
        html = renderCatalog(route.params);
        document.title = "Каталог — Цветущая кондитерская";
        break;
      case "product": {
        html = renderProduct(route.id);
        const prod = Store.getProduct(route.id);
        document.title = prod
          ? `${prod.name} — Цветущая кондитерская`
          : "Товар — Цветущая кондитерская";
        break;
      }
      case "cart":
        html = renderCart();
        document.title = "Корзина — Цветущая кондитерская";
        break;
      case "delivery":
        html = renderDelivery();
        document.title = "Доставка — Цветущая кондитерская";
        break;
      case "privacy":
        html = renderPrivacy();
        document.title = "Конфиденциальность — Цветущая кондитерская";
        break;
      case "offer":
        html = renderOffer();
        document.title = "Оферта — Цветущая кондитерская";
        break;
      case "admin":
        html = renderAdmin();
        document.title = "Админка — Цветущая кондитерская";
        break;
      default:
        html = renderHome();
    }

    app.innerHTML = html;
    setActiveNav(
      route.name === "product"
        ? `/product/${route.id}`
        : route.name === "home"
          ? "/"
          : `/${route.name}`
    );
    updateCartBadge();
    bindPageEvents(route);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    nav?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }

  /* Header UI */
  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 12);
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("ck:cart", updateCartBadge);

  if (!location.hash) location.hash = "#/";
  else render();
})();
