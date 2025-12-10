import { useState } from 'react';
import Layout from './components/Layout';
import CampaignForm from './components/CampaignForm';
import AdSetForm from './components/AdSetForm';
import AdNameForm from './components/AdNameForm';
import LinkGenForm from './components/LinkGenForm';

function App() {
  const [activeTab, setActiveTab] = useState('campaign');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'campaign' && <CampaignForm />}
      {activeTab === 'adset' && <AdSetForm />}
      {activeTab === 'ad' && <AdNameForm />}
      {activeTab === 'link' && <LinkGenForm />}
    </Layout>
  );
}

export default App;
