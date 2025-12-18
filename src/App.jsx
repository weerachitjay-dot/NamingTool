import { useState } from 'react';
import Layout from './components/Layout';
import CampaignForm from './components/CampaignForm';
import AdSetForm from './components/AdSetForm';
import AdNameForm from './components/AdNameForm';
import LinkGenForm from './components/LinkGenForm';
import NameParser from './components/NameParser';
import PhoneNormalizer from './components/PhoneNormalizer';
import { ConfigProvider } from './context/ConfigContext';

function App() {
  const [activeTab, setActiveTab] = useState('campaign');

  return (
    <ConfigProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'campaign' && <CampaignForm />}
        {activeTab === 'adset' && <AdSetForm />}
        {activeTab === 'ad' && <AdNameForm />}
        {activeTab === 'link' && <LinkGenForm />}
        {activeTab === 'nameparser' && <NameParser />}
        {activeTab === 'phonenormalizer' && <PhoneNormalizer />}
      </Layout>
    </ConfigProvider>
  );
}

export default App;
