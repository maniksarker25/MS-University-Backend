import { v2 as cloudinary } from 'cloudinary';
export const sendImageToCloudinary = () => {
  cloudinary.config({
    cloud_name: 'dp6nuvot3',
    api_key: '578152791375281',
    api_secret: 'N8x2HVDeXXZvOUJkAV40S-nWx-g',
  });
  //
  cloudinary.uploader.upload(
    'https://cdn.britannica.com/34/212134-050-A7289400/Lionel-Messi-2018.jpg',
    { public_id: 'messi' },
    function (error, result) {
      console.log(result);
    },
  );
};
