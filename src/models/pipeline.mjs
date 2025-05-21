import axios from 'axios';

async function runPipeline() {
  try {
    const headers = {
      headers: {
        'X-Api-Key': '7cb76bd981a544c6a40917aa42594506'
      }
    };

    const [
      userRandom,
      phoneNumberRandom,
      creditCardRandom,
      nameRandom,
      socialNumberRandom,
      boredResponse,
      yesNoResponse
    ] = await Promise.all([
      axios.get('https://randomuser.me/api/'),
      axios.get('https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1', headers),
      axios.get('https://randommer.io/api/Card?type=AmericanExpress', headers),
      axios.get('https://randommer.io/api/Name?nameType=firstname&quantity=1', headers),
      axios.get('https://randommer.io/api/SocialNumber', headers),
      axios.get('https://bored-api.appbrewery.com/random'),
      axios.get('https://yesno.wtf/api')
    ]);

    const user = userRandom.data.results[0];

    const profile = {
      user: {
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        gender: user.gender,
        location: `${user.location.city}, ${user.location.country}`,
        picture: user.picture.large
      },
      phone_number: phoneNumberRandom.data[0],
      iban: 'FR1420041010050500013M02606',
      credit_card: {
        card_number: creditCardRandom.data.cardNumber,
        card_type: creditCardRandom.data.type,
        expiration_date: creditCardRandom.data.expiration,
        cvv: creditCardRandom.data.cvv
      },
      random_name: nameRandom.data[0],
      social_number: socialNumberRandom.data[0],
      activity: boredResponse.data.activity,
      yes_no: yesNoResponse.data.answer
    };

    console.log(JSON.stringify(profile, null, 2));
  } catch (err) {
    console.error('❌ Erreur dans le pipeline :', err.message);
  }
}

runPipeline();
