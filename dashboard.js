
var sleep = time => new Promise(resolve => setTimeout(resolve, time))
var poll = (promiseFn, time) => promiseFn().then(
             sleep(time).then(() => poll(promiseFn, time)))

// Greet the World every second
// poll(() => new Promise(() => console.log(navigator.getGamepads()[1])), 1000/30)