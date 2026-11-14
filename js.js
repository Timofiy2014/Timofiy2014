
document.addEventListener('DOMContentLoaded', function () {

    let cart = [];

    // ЗАВАНТАЖЕННЯ ЗБЕРЕЖЕНОГО КОШИКА
    try {
        const saved = JSON.parse(localStorage.getItem('fiammaCart'));

        if (Array.isArray(saved)) {
            cart = saved.filter(item =>
                item &&
                typeof item.name === 'string' &&
                Number.isFinite(item.price) &&
                item.price >= 0 &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            );
        }
    } catch (error) {
        cart = [];
    }

    // ЕЛЕМЕНТИ
    const cartToggle = document.getElementById('cartToggle');
    const cartModal = document.getElementById('cartModal');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const closeCart = document.getElementById('closeCart');

    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartBadge = document.getElementById('cartBadge');

    const orderButton = document.getElementById('orderButton');
    const toast = document.getElementById('toast');

    // ПЕРЕВІРКА HTML
    if (
        !cartToggle || !cartModal || !cartBackdrop ||
        !closeCart || !cartItems || !cartTotal ||
        !cartBadge || !orderButton || !toast
    ) {
        console.error('Помилка: не знайдено один із елементів кошика в HTML!');
        return;
    }

    // ЗБЕРЕЖЕННЯ
    function saveCart() {
        try {
            localStorage.setItem('fiammaCart', JSON.stringify(cart));
        } catch (error) {
            console.error('Не вдалося зберегти кошик:', error);
        }
    }

    // ВІДКРИТИ КОШИК
    function openCart() {
        cartModal.classList.add('active');
        cartBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ЗАКРИТИ КОШИК
    function closeCartModal() {
        cartModal.classList.remove('active');
        cartBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    cartBackdrop.addEventListener('click', closeCartModal);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeCartModal();
        }
    });

    // ПОВІДОМЛЕННЯ
    let toastTimer;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.remove('show');
        }, 2000);
    }

    // АНІМАЦІЯ ПІЦИ
    function flyToCart(button) {
        const start = button.getBoundingClientRect();
        const end = cartToggle.getBoundingClientRect();

        const pizza = document.createElement('div');

        pizza.className = 'flying-pizza';
        pizza.textContent = '';
        pizza.style.left = start.left + 'px';
        pizza.style.top = start.top + 'px';

        document.body.appendChild(pizza);

        const x = end.left - start.left;
        const y = end.top - start.top;

        requestAnimationFrame(function () {
            pizza.style.transform =
                `translate(${x}px, ${y}px) scale(0.2) rotate(360deg)`;
            pizza.style.opacity = '0';
        });

        setTimeout(function () {
            pizza.remove();
        }, 800);

        cartToggle.classList.remove('cart-bounce');
        void cartToggle.offsetWidth;
        cartToggle.classList.add('cart-bounce');
    }

    // ДОДАТИ ПІЦУ
    function addPizza(name, price) {

        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        renderCart();
        showToast(name + ' додано до кошика! ');
    }

    // НАТИСКАННЯ НА ЦІНУ
    document.addEventListener('click', function (event) {

        const button = event.target.closest('.price');

        if (!button) return;

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (!name || !Number.isFinite(price) || price < 0) {
            console.error('Перевір data-name та data-price у кнопці!');
            return;
        }

        flyToCart(button);
        addPizza(name, price);

    });

    // КІЛЬКІСТЬ
    function changeQuantity(index, amount) {

        if (!cart[index]) return;

        cart[index].quantity += amount;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        renderCart();
    }

    // ВИДАЛИТИ ПІЦУ
    function removePizza(index) {

        if (!cart[index]) return;

        const name = cart[index].name;

        cart.splice(index, 1);

        renderCart();

        showToast(name + ' видалено з кошика');
    }

    // ОНОВИТИ КОШИК
    function renderCart() {

        cartItems.innerHTML = '';

        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">🍕</div>
                    <h3>Кошик порожній</h3>
                    <p>Саме час обрати щось смачненьке!</p>
                </div>
            `;
        }

        cart.forEach(function (item, index) {

            total += item.price * item.quantity;
            count += item.quantity;

            const row = document.createElement('div');
            row.className = 'cart-row';

            const info = document.createElement('div');
            info.className = 'cart-info';

            const name = document.createElement('h3');
            name.textContent = ' ' + item.name;

            const price = document.createElement('p');
            price.textContent = '$' + item.price + ' / шт.';

            info.append(name, price);

            const controls = document.createElement('div');
            controls.className = 'cart-controls';

            const minus = document.createElement('button');
            minus.type = 'button';
            minus.textContent = '−';
            minus.title = 'Зменшити кількість';

            minus.addEventListener('click', function () {
                changeQuantity(index, -1);
            });

            const quantity = document.createElement('span');
            quantity.className = 'quantity';
            quantity.textContent = item.quantity;

            const plus = document.createElement('button');
            plus.type = 'button';
            plus.textContent = '+';
            plus.title = 'Додати ще';

            plus.addEventListener('click', function () {
                changeQuantity(index, 1);
            });

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.textContent = '×';
            remove.className = 'remove-item';
            remove.title = 'Видалити піцу';

            remove.addEventListener('click', function () {
                removePizza(index);
            });

            controls.append(minus, quantity, plus, remove);

            const subtotal = document.createElement('strong');
            subtotal.className = 'cart-subtotal';
            subtotal.textContent = '$' + (item.price * item.quantity);

            row.append(info, controls, subtotal);

            cartItems.appendChild(row);

        });

        cartTotal.textContent = '$' + total;
        cartBadge.textContent = count;
        orderButton.disabled = cart.length === 0;

        saveCart();
    }

    // КУПИТИ
    orderButton.addEventListener('click', function () {

        if (cart.length === 0) return;

        const order = cart.map(function (item) {
            return item.name + ' — ' + item.quantity + ' шт.';
        }).join('\n');

        const total = cart.reduce(function (sum, item) {
            return sum + item.price * item.quantity;
        }, 0);

        alert(
            'ВАШЕ ЗАМОВЛЕННЯ \n\n' +
            order +
            '\n\nРазом: $' + total +
            '\n\nДякуємо за замовлення!'
        );

        cart = [];

        renderCart();
        closeCartModal();

        showToast('Дякуємо за покупку! ');
    });

    // ПОЧАТКОВИЙ ЗАПУСК
    renderCart();

    console.log("FIAMMA JAVASCRIPT ПРАЦЮЄ!"); 
})

