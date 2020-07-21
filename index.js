const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');

const baseURL = 'https://jobs.sanctuary-group.co.uk';
const searchURL = '/search/?q=&sortColumn=referencedate&sortDirection=desc&startrow=';
var wholeURL = baseURL + searchURL + i
for (var i = 0; i < 176; i = i + 25) {
    const getJobs = async () => {
    const html = await rp(wholeURL);
    const jobsMap = cheerio('a.jobTitle-link', html).map(async (i, e) => {
      const link = baseURL + e.attribs.href;
      const innerHtml = await rp(link);
      const Title = cheerio('h1 > span:nth-child(2)', innerHtml).text().trim();
      const Location = cheerio('#job-location > span', innerHtml).text().trim();
      const Department = cheerio('#content > div > div.jobDisplayShell > div > div.content > div.job > div:nth-child(3) > div > div > div > span:nth-child(2)', innerHtml).text().trim();
      const Operation = cheerio('#content > div > div.jobDisplayShell > div > div.content > div.job > div:nth-child(4) > div > div > div > span:nth-child(2)', innerHtml).text().trim();
      const Requisition_Number = cheerio('#content > div > div.jobDisplayShell > div > div.content > div.job > div:nth-child(5) > div > div > div > span:nth-child(2)', innerHtml).text().trim();
      const description = cheerio('span.jobdescription', innerHtml).text().trim();
      var PaySearch = description.search("£");
      var payStart = description.slice(PaySearch);
      var PayEndSearch = payStart.search("\n");
      var Pay = payStart.slice(0, PayEndSearch);
      var ClosingSearch = description.search("ate:");
      var Closing_Date = description.slice(ClosingSearch + 5, ClosingSearch + 30);
      var description_noPay = description.replace(Pay,'');
      var Job_Description = description_noPay.replace(Closing_Date,'');

      return {
        Title,
        Location,
        Department,
        Operation,
        Requisition_Number,
        Pay,
        Closing_Date,
        Job_Description,
      }
    }).get();
    return Promise.all(jobsMap);
  };
getJobs()
  .then(result => {
    const transformed = new otcsv(result);
    return transformed.toDisk('./JobsSanctuary.csv');
  })
  .then(() => console.log('SUCCESSFULLY COMPLETED THE WEB SCRAPING SAMPLE'));
}
