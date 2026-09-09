const demos = {
  日本: { flag: '🇯🇵', code: 'JP', address: '東京都新宿区新宿4丁目5-10', postal: '〒160-6421 · 090-4795-9280' },
  美国: { flag: '🇺🇸', code: 'US', address: '6852 Library Lane, Milford, Delaware', postal: '19960 · +1 302-384-7568' },
  英国: { flag: '🇬🇧', code: 'GB', address: '24 King Street, Manchester, M2 6AG', postal: 'M2 6AG · +44 161 496 0280' },
  中国: { flag: '🇨🇳', code: 'CN', address: '江苏省南京市鼓楼区中山东路205号', postal: '210000 · 025-4960-2800' },
  德国: { flag: '🇩🇪', code: 'DE', address: 'Hauptstraße 24, 10115 Berlin', postal: '10115 · +49 30 4960280' },
  加拿大: { flag: '🇨🇦', code: 'CA', address: '24 King Street, Toronto, ON', postal: 'M5V 2K4 · +1 416-496-0280' }
};

document.querySelectorAll('.country-choice').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.country-choice').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const data = demos[button.dataset.country];
    if (!data) return;
    document.querySelector('#demoFlag').textContent = data.flag;
    document.querySelector('#demoCountry').textContent = button.dataset.country;
    document.querySelector('.demo-code').textContent = data.code;
    document.querySelector('#demoAddress').textContent = data.address;
    document.querySelector('.demo-address span').textContent = data.postal;
  });
});
