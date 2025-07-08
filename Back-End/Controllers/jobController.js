const axios = require('axios');
const Job = require('../models/Job');

// Define Jobicy API endpoints (without ?type=full-time)
const API_ENDPOINTS = [
  'https://jobicy.com/api/v2/remote-jobs?count=20&industry=copywriting',
  'https://jobicy.com/api/v2/remote-jobs?count=20&industry=business',
  'https://jobicy.com/api/v2/remote-jobs?count=20&industry=management',
  'https://jobicy.com/api/v2/remote-jobs?count=20&industry=data-science',
  'https://jobicy.com/api/v2/remote-jobs?count=20&industry=smm'
];

// Fetch and store only full-time jobs
exports.fetchJobs = async (req, res) => {
  let totalAdded = 0;

  for (const url of API_ENDPOINTS) {
    try {
      const { data } = await axios.get(url);

      if (!data.jobs || !Array.isArray(data.jobs)) {
        console.warn(`⛔ Invalid response from: ${url}`);
        continue;
      }

      console.log(`📡 Fetched ${data.jobs.length} jobs from ${url}`);

      // Filter full-time jobs (handles string or array values)
      const fullTimeJobs = data.jobs.filter(item => {
        const types = Array.isArray(item.jobType) ? item.jobType : [item.jobType];
        return types.some(type => typeof type === 'string' && type.toLowerCase().includes('full'));
      });

      console.log(`🔍 Found ${fullTimeJobs.length} full-time jobs`);

      for (const item of fullTimeJobs) {
        const job = {
          title: item.jobTitle?.trim(),
          link: item.url?.trim(),
          pubDate: new Date(item.pubDate || Date.now()),
          summary: item.jobExcerpt || '',
          company: item.companyName || '',
          location: item.jobGeo || '',
          industry: Array.isArray(item.jobIndustry)
            ? item.jobIndustry.join(', ')
            : item.jobIndustry || '',
          type: Array.isArray(item.jobType)
            ? item.jobType.join(', ')
            : item.jobType || '',
          description: item.jobDescription || ''
        };

        if (!job.title || !job.link) continue;

        const result = await Job.updateOne(
          { link: job.link },
          { $setOnInsert: job },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          console.log('✅ Inserted:', job.title);
          totalAdded++;
        } else {
          console.log('🔁 Duplicate skipped:', job.link);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // throttle API calls
    } catch (err) {
      console.error(`❌ Error fetching from ${url}:`, err.message);
    }
  }

  console.log(`✅ Job API sync complete | New entries added: ${totalAdded}`);
  res.status(200).json({ message: 'Job feeds updated via API', newJobs: totalAdded });
};

exports.getJobs = async (req, res) => {
  try {
    // Replace this with your actual DB query
    const jobs = await Job.find(); // Make sure Job model is imported
    res.json(jobs);
  } catch (err) {
    console.error('❌ Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
}