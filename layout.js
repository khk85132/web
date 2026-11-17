/* =========================================================
   layout.js — 공통 GNB / 좌·우 사이드 드로어 / 푸터 / 공통 유틸
   ========================================================= */
(function () {
  const user = Store.get(KEYS.session, null);

  const LEFT_MENUS = {
    gyeolsil: { title: '결실', links: [['브랜드', 'brand.html'], ['오시는 길', 'branches.html']] },
    sanmul: { title: '산물', links: [['커피', 'coffee.html'], ['티', 'tea.html'], ['음료', 'beverage.html']] }
  };

  const header = `
  <header class="gnb">
    <nav class="gnb-left">
      <button class="gnb-item" data-left="gyeolsil">결실</button>
      <button class="gnb-item" data-left="sanmul">산물</button>
      <a class="gnb-item" href="tumbler.html">텀블러</a>
      <a class="gnb-item" href="FAQ.html">FAQ</a>
      <a class="gnb-item" href="reviews.html">리뷰</a>
    </nav>
    <a class="logo" href="index.html"><img src="${IMG.logo}" alt="결 GYEOL"></a>
    <nav class="gnb-right">
      <button class="gnb-item" id="loginBtn">${user ? esc(user.name) + '님' : '로그인'}</button>
      <a class="gnb-item cart-link" href="cart.html">장바구니<span class="badge" id="cartBadge">0</span></a>
    </nav>
  </header>
  <div class="overlay" id="overlay"></div>
  <aside class="drawer left" id="drawerLeft"></aside>
  <aside class="drawer right" id="drawerRight"></aside>
  <div class="toast" id="toast"></div>`;

  const footer = `
  <footer class="footer">
    <div class="footer-info">
      ${/* 주소: (주석 처리) 필요 시 아래 줄의 주석을 해제하고 주소를 입력하세요. */ ''}
      <p>주소: 서울특별시 성동구 서울숲2길 34-12</p>
      <p>TEL: 010-9934-5201</p>
      <p>대표 이사: 김현강 장문선</p>
    </div>
    <div class="footer-sub">© 2026 GYEOL INC., ALL RIGHTS RESERVED</div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);

  const $ = s => document.querySelector(s);
  const overlay = $('#overlay'), dl = $('#drawerLeft'), dr = $('#drawerRight');

  function closeAll() { dl.classList.remove('open'); dr.classList.remove('open'); overlay.classList.remove('show'); }
  overlay.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  /* 왼쪽 드로어 */
  document.querySelectorAll('[data-left]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = LEFT_MENUS[btn.dataset.left];
      dl.innerHTML = `<button class="drawer-close" aria-label="닫기">×</button><h3>${m.title}</h3>
        <ul class="drawer-links">${m.links.map(l => `<li><a href="${l[1]}">${l[0]}</a></li>`).join('')}</ul>`;
      dl.querySelector('.drawer-close').onclick = closeAll;
      dr.classList.remove('open');
      dl.classList.add('open'); overlay.classList.add('show');
    });
  });

  /* 오른쪽 드로어 (로그인 / 로그아웃) */
  function renderRight(msg) {
    const u = Store.get(KEYS.session, null);
    if (u) {
      dr.innerHTML = `<button class="drawer-close" aria-label="닫기">×</button><h3>마이페이지</h3>
        <p class="drawer-hello">${esc(u.name)}님, 환영합니다.</p>
        <a class="btn block" id="mypageBtn" href="mypage.html" style="margin-bottom:10px">마이페이지로 이동</a>
        <button class="btn block ghost" id="logoutBtn">로그아웃</button>`;
      dr.querySelector('#logoutBtn').onclick = () => { localStorage.removeItem(KEYS.session); location.reload(); };
    } else {
      dr.innerHTML = `<button class="drawer-close" aria-label="닫기">×</button><h3>로그인</h3>
        <form id="loginForm" autocomplete="off">
          <input class="input" id="loginId" placeholder="아이디" required>
          <input class="input" id="loginPw" type="password" placeholder="비밀번호" required>
          <p class="form-msg" id="loginMsg">${msg ? esc(msg) : ''}</p>
          <button class="btn block" type="submit">로그인</button>
        </form>
        <a class="drawer-join" href="signup.html">회원가입</a>`;
      dr.querySelector('#loginForm').onsubmit = e => {
        e.preventDefault();
        const id = $('#loginId').value.trim(), pw = $('#loginPw').value;
        const found = Store.get(KEYS.users, []).find(x => x.id === id && x.pw === pw);
        if (!found) { $('#loginMsg').textContent = '아이디 또는 비밀번호가 올바르지 않습니다.'; return; }
        Store.set(KEYS.session, { id: found.id, name: found.name });
        location.reload();
      };
    }
    dr.querySelector('.drawer-close').onclick = closeAll;
  }
  $('#loginBtn').addEventListener('click', () => {
    renderRight();
    dl.classList.remove('open');
    dr.classList.add('open'); overlay.classList.add('show');
  });

  /* 장바구니 배지 */
  window.updateCartBadge = function () {
    const n = Cart.count(), b = $('#cartBadge');
    b.textContent = n; b.style.display = n ? 'inline-flex' : 'none';
  };
  updateCartBadge();

  /* 토스트 */
  let tt;
  window.showToast = function (msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1800);
  };

  /* 상품 그리드 (커피/티/음료/텀블러 공통) */
  window.renderProducts = function (group) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = MENUS.filter(m => m.group === group).map(m => `
      <article class="card">
        <div class="card-img">
          <img src="${m.img}" alt="${esc(m.name)}">
          <button class="cta" data-add="${m.id}">카트에 추가 <span class="cta-sep">|</span> ₩${Number(m.price).toLocaleString('ko-KR')}</button>
        </div>
        <h3>${esc(m.name)}</h3>
        <p>${esc(m.desc)}</p>
      </article>`).join('');
    grid.addEventListener('click', e => {
      const b = e.target.closest('[data-add]'); if (!b) return;
      Cart.add(b.dataset.add); updateCartBadge();
      showToast(getMenu(b.dataset.add).name + '을(를) 장바구니에 담았어요.');
    });
  };

  /* 범용 캐러셀: root 안에 .track > .slide, .prev, .next, .dots */
  window.Carousel = function (root, opt) {
    opt = opt || {};
    const per = opt.per || 1;
    const track = root.querySelector('.track');
    const slides = root.querySelectorAll('.slide');
    const dots = root.querySelector('.dots');
    const max = Math.max(0, slides.length - per);
    let idx = 0, timer;
    slides.forEach(s => s.style.flex = '0 0 ' + (100 / per) + '%');
    if (dots) {
      dots.innerHTML = Array.from(slides).map((_, i) => `<button class="dot" aria-label="${i + 1}번째"></button>`).join('');
      dots.querySelectorAll('.dot').forEach((d, i) => d.onclick = () => { go(i); restart(); });
    }
    function go(i) {
      idx = i > max ? 0 : (i < 0 ? max : i);
      track.style.transform = 'translateX(' + (-idx * 100 / per) + '%)';
      if (dots) dots.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('active', k === idx));
    }
    function restart() { if (!opt.auto) return; clearInterval(timer); timer = setInterval(() => go(idx + 1), opt.auto); }
    root.querySelector('.prev').onclick = () => { go(idx - 1); restart(); };
    root.querySelector('.next').onclick = () => { go(idx + 1); restart(); };
    go(0); restart();
  };
})();
