# ninelines-router

Минималистичный JavaScript роутер для работы с одностраничными сайтами и приложениями ([SPA](https://ru.wikipedia.org/wiki/Одностраничное_приложение)).

Особенности:

* Параметризованные URL (благодаря библиотеке [path-to-regexp](https://github.com/pillarjs/path-to-regexp));
* События с поддержкой Promise;
* Удобная работа с URL и GET-параметрами (благодаря библиотекам [url-parse](https://github.com/unshiftio/url-parse) и [querystringify](https://github.com/unshiftio/querystringify));
* Именованные маршруты;
* Поддержка создания переходов для предзаданных маршрутов.

## Установка

### NPM

Для установки с помощью npm требуется выполнить следующую команду:

```bash
npm install --save ninelines-router
```

## Использование

### Основы

После установки роутер необходимо подключить:

```js
import {Router} from 'ninelines-router';
```

И инициализировать:

```js
let router = new Router();
```

> При отсутствии модульной системы библиотека (`dist/ninelines-router.js`) экспортирует `Router` в глобальный объект `ninelines.router`:
> ```js
> let router = new ninelines.router.Router();
> ```

Далее создаем необходимые маршруты:

```js
router.addRoute('/', () => {
    // ...
});

router.addRoute('/about', () => {
    // ...
});

router.addRoute('/contacts', () => {
    // ...
});
```

И в конце запускаем роутер:

```js
router.start();
```

### Параметризованные URL

Роутер поддерживает создание маршрутов с параметризованными URL.

```js
router.addRoute('/article/:id', (prevState, currentState) => {
    let id = currentState.params.id;

    // ...
});
```

`prevState` и `currentState` хранят состояние сайта в различный момент времени: `prevState` до перехода, `currentState` после перехода.

Объект состояния имеет следующую структуру:

```
{
    route: Route,
    params: Object,
    query: Object,
}
```

* `route` - инстанс маршрута, который соответствует данному состоянию или `null`, если такого маршрута нет (например, `prevState.route === null` при первом переходе на сайт); 
* `params` - объект с параметрами данного состояния;
* `query` - объект с GET-параметрами данного состояния;

Пример:

```js
router.addRoute('/article/:id', (prevState, currentState) => {
    // При переходе по ссылке /article/42
    // currentState.params === {id: '42'}
    // currentState.query === {}

    // При переходе по ссылке /article/42?x=10&y=4&z=8
    // currentState.params === {id: '42'}
    // currentState.query === {x: '10', y: '4', z: '8'}
});
```

Более подробную информацию о параметризованных URL можно найти в документации к библиотеке [path-to-regexp](https://github.com/pillarjs/path-to-regexp).

### Именованные маршруты

Роутер поддерживает создание именованных маршрутов:

```js
router.addRoute('/', 'home', () => {
    // ...
});

router.addRoute('/about', 'about', () => {
    // ...
});

router.addRoute('/article/:id', 'article', (prevState, currentState) => {
    // ...
});
```

### Переходы между страницами

Перейти на другую страницу можно следующим образом:

```js
router.navigate('/');

router.navigate('/article/42');

// Первым параметром можно передать имя маршрута
router.navigate('article', {
    id: 42,
});
```

Также имеется возможность привязать любую ссылку к роутеру, добавив атрибут `data-router-link`:

```html
<a href="/article/42" data-router-link>
    Перейти на 42-ую статью
</a>
```

Если ссылки с атрибутом `data-router-link` подгружаются динамически вместе с контентом, то требуется вручную привязать их к роутеру:
```js
router.bindLinks();
```

### События

Маршруты поддерживают три основные события:

* `beforeEnter` - срабатывает до перехода по маршруту;
* `enter` - срабатывает после перехода по маршруту;
* `leave` - срабатывает при покидании маршрута;

Пример:

```js
router.addRoute('/', (prevState, currentState) => {
    // enter
});

router.addRoute('/about', (prevState, currentState) => {
    // enter
}, (currentState, nextState) => {
    // leave
});

router.addRoute('/contacts', (currentState, nextState) => {
    // beforeEnter
}, (prevState, currentState) => {
    // enter
}, (currentState, nextState) => {
    // leave
});

router.addRoute('/article/:id', {
    onBeforeEnter(currentState, nextState) {
        // ...
    },
    onEnter(prevState, currentState) {
        // ...
    },
    onLeave(currentState, nextState) {
        // ...
    },
});
```

Сам роутер поддерживает следующие события:

* `start` - срабатывает до события `beforeEnter`;
* `leave` - срабатывает при покидании какого-либо маршрута;
* `beforeEnter` - срабатывает до перехода по какому-либо маршруту;
* `enter` - срабатывает после перехода по какому-либо маршруту;
* `complete` - срабатывает после завершения события `enter`;
* `notFound` - срабатывает в том случае, если подходящий маршрут не найден;

Пример:

```js
router.on('notFound', (path) => {
    // ...
});
```

При необходимости событие можно вызвать вручную:

```js
router.trigger('notFound', [location.pathname]);
```

Можно передать дополнительные параметры:

```js
router.on('notFound', (path, state) => {
    // ...
});

router.trigger('notFound', [
    location.pathname,
    {
        route: router.getRoute('article'),
        params: {
            id: 42,
        },
    }
]);
```

### Использование Promise

При необходимости из любого события можно вернуть `Promise`:

```js
let pageHome = document.getElementById('page-home');

router.addRoute('/', {
    onEnter() {
        return new Promise((resolve) => {
            pageHome.classList.remove('is-hidden');

            TweenMax.from(pageHome, 1, {
                opacity: 0,
                clearProps: 'opacity',
                onComplete() {
                    resolve();
                },
            });
        });
    },
    onLeave() {
        return new Promise((resolve) => {
            TweenMax.to(pageHome, 1, {
                opacity: 0,
                onComplete() {
                    pageHome.classList.add('is-hidden');
                    
                    TweenMax.set(pageHome, {
                        clearProps: 'opacity',
                    });
                    
                    resolve();
                },
            });
        });
    },
});
```

### Transition

`Transition` используется для обработки предзаданных переходов.

```js
router.addRoute('/', () => {
    // ...
});

router.addRoute('/about', () => {
    // ...
});

router.addRoute('/article/:id', 'article', (prevState, currentState) => {
    // ...
});

router.addRoute('/news/:year/:month/:day', 'news', (prevState, currentState) => {
    // ...
});

// Переход / => /about
router.addTransition('/', '/about', () => {
    // ...
});

// Переход article => news
router.addTransition('article', 'news', () => {
    // ...
});
```

Того же результата можно добиться и без `Transition`:

```js
router.addRoute('/', () => {
    // ...
});

router.addRoute('/about', (prevState) => {
    if (prevState.route.path === '/') {
        // ...
    }
});
```

Но синтаксис `addTransition` проще, чем множество условий. К тому же `Transition` поддерживает события `beforeEnter`, `enter`, `leave` и предоставляет два дополнительных события:

* `start` - начало перехода;
* `complete` - конец перехода;

Порядок вызова событий выглядит следующим образом:

1. `start`
2. `leave`
3. `beforeEnter` 
4. `enter`
5. `complete`

```js
router.addTransition('/', '/about', (prevState, currentState) => {
    // enter
});

router.addTransition('/', '/about', (currentState, nextState) => {
    // leave
}, (prevState, currentState) => {
    // enter
});

router.addTransition('/', '/about', (currentState, nextState) => {
    // leave
}, (currentState, nextState) => {
    // beforeEnter
}, (prevState, currentState) => {
    // enter
});

router.addTransition('/', '/about', (currentState, nextState) => {
    // leave
}, (currentState, nextState) => {
    // beforeEnter
}, (prevState, currentState) => {
    // enter
}, (prevState, currentState) => {
    // complete
});

router.addTransition('/', '/about', (currentState, nextState) => {
    // start
}, (currentState, nextState) => {
    // leave
}, (currentState, nextState) => {
    // beforeEnter
}, (prevState, currentState) => {
    // enter
}, (prevState, currentState) => {
    // complete
});

router.addTransition('/', '/about', {
    onStart(currentState, nextState) {
        // ...
    },
    onLeave(currentState, nextState) {
        // ...
    },
    onBeforeEnter(currentState, nextState) {
        // ...
    },
    onEnter(prevState, currentState) {
        // ...
    },
    onComplete(prevState, currentState) {
        // ...
    },
});
```

## API

### [EventEmitter](src/EventEmitter.js)

#### `EventEmitter()`
#### `.on(eventName, handler)`
#### `.off(eventName)`
#### `.off(eventName, handler)`
#### `.trigger(eventName)`
#### `.trigger(eventName, params)`

### [Route](src/Route.js) (наследуется от `EventEmitter`)

#### `Route(path)`
#### `Route(path, name)`
#### `Route(path, name, options)`
#### `.execPath(path)`
#### `.generatePath()`
#### `.generatePath(params)`
#### `.generatePath(params, query)`
#### `.generatePath(params, query, hash)`

### [Transition](src/Transition.js) (наследуется от `EventEmitter`)

#### `Transition(from, to)`

### [Router](src/Router.js) (наследуется от `EventEmitter`)

#### `Router()`
#### `.addRoute(path)`
#### `.addRoute(path, name)`
#### `.addRoute(path, name, onEnter)`
#### `.addRoute(path, name, onEnter, onLeave)`
#### `.addRoute(path, name, onBeforeEnter, onEnter, onLeave)`
#### `.addRoute(path, onEnter)`
#### `.addRoute(path, onEnter, onLeave)`
#### `.addRoute(path, onBeforeEnter, onEnter, onLeave)`
#### `.addRoute(options)`
#### `.addRoute(path, options)`
#### `.addRoute(path, name, options)`
#### `.addTransition(transition)`
#### `.addTransition(transition, onEnter)`
#### `.addTransition(transition, onLeave, onEnter)`
#### `.addTransition(transition, onLeave, onBeforeEnter, onEnter)`
#### `.addTransition(transition, onLeave, onBeforeEnter, onEnter, onComplete)`
#### `.addTransition(transition, onStart, onLeave, onBeforeEnter, onEnter, onComplete)`
#### `.addTransition(from, to)`
#### `.addTransition(from, to, onEnter)`
#### `.addTransition(from, to, onLeave, onEnter)`
#### `.addTransition(from, to, onLeave, onBeforeEnter, onEnter)`
#### `.addTransition(from, to, onLeave, onBeforeEnter, onEnter, onComplete)`
#### `.addTransition(from, to, onStart, onLeave, onBeforeEnter, onEnter, onComplete)`
#### `.addTransition(options)`
#### `.addTransition(transition, options)`
#### `.addTransition(from, to, options)`
#### `.resolve(path)`
#### `.resolve(path, method)`
#### `.navigate(path)`
#### `.navigate(path, params)`
#### `.navigate(path, params, query)`
#### `.navigate(path, params, query, hash)`
#### `.navigate(path, method)`
#### `.navigate(path, params, method)`
#### `.navigate(path, params, query, method)`
#### `.navigate(path, params, query, hash, method)`
#### `.navigate(options)`
#### `.bindLinks()`
#### `.listen()`
#### `.start()`
