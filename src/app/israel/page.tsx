import { Metadata } from 'next';
import IsraelHero from '@/components/israel/IsraelHero';
import IsraelNav from '@/components/israel/IsraelNav';
import BiblicalFoundation from '@/components/israel/BiblicalFoundation';
import IsraelVOD from '@/components/israel/IsraelVOD';
import Prophecy from '@/components/israel/Prophecy';
import PrayerCall from '@/components/israel/PrayerCall';
import Navbar from '@/components/layout/Navbar'; 
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: 'Ísrael | Omega Stöðin',
    description: 'Kannaðu dýpt sáttmálans, mikilvægi landsins í Ritningunni og spádómlegt hlutverk Ísraels á okkar tímum og í framtíðinni.',
};

export default function IsraelPage() {
    return (
        <div style={{ backgroundColor: 'var(--nott)', minHeight: '100vh', color: 'var(--ljos)' }}>
            <Navbar />
            <IsraelHero />
            <IsraelNav />
            <BiblicalFoundation />
            <IsraelVOD />
            <Prophecy />
            <PrayerCall />
            <Footer />
        </div>
    );
}
