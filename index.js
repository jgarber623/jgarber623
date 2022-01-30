#!/usr/bin/env node

const axios = require('axios');
const commaNumber = require('comma-number');
const fs = require('fs');
const { Liquid } = require('liquidjs');

const engine = new Liquid();

const npm_badge_count = async () => {
  try {
    const { data } = await axios.get('https://api.npms.io/v2/search?q=author:jgarber');

    const packageNames = data.results.map(result => result.package.name);

    const packagesDownloadsCount = await Promise.all(packageNames.map(async packageName => {
      const { data } = await axios.get(`https://api.npms.io/v2/package/${encodeURIComponent(packageName)}`);

      return data.collected.npm.downloads.map(download => download.count);
    }));

    const totalDownloadsCount = packagesDownloadsCount.flat().reduce((accumulator, currentValue) => accumulator + currentValue);

    return commaNumber(totalDownloadsCount);
  } catch (error) {
    console.log(error);
  }
};

const rubygems_badge_count = async () => {
  try {
    const { data } = await axios.get('https://rubygems.org/api/v1/owners/jgarber623/gems.json');

    const totalDownloadsCount = data.map(gem => gem.downloads).reduce((accumulator, currentValue) => accumulator + currentValue);

    return commaNumber(totalDownloadsCount);
  } catch (error) {
    console.log(error);
  }
};

engine
  .renderFile('README.md.liquid', { npm_badge_count, rubygems_badge_count })
  .then(data => fs.writeFileSync('README.md', data));
