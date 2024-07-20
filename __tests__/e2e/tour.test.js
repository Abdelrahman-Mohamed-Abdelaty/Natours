const puppeteer=require('puppeteer');

async function main(){
    const browser=await puppeteer.launch({headless:false});
    const page=await browser.newPage();
    console.log('e2e test is being processed...')
    await page.goto('http://localhost:3000/login');
    //login
    await page.type('input[id=email]','user@gmail.com');
    await page.type('input[id=password]','12345678');
    await page.click('.btn');
    // Wait for the page to load and the first card to be available
    await page.waitForSelector('.card-container .card');

    // Click on the "Details" button of the first card
    await page.click('.card-container .card:first-child .btn--green.btn--small');

    // Wait for the page to load and the button to be available
    await page.waitForSelector('#book-tour');

    // Click on the "Book tour now!" button
    await page.click('#book-tour');
    await page.waitForSelector('input[id=cardNumber]');

    await page.type('input[id=cardNumber]','4242 4242 4242 4242');
    await page.type('input[id=cardExpiry]','05/27');
    await page.type('input[id=cardCvc]','123');
    await page.type('input[id=billingName]','Abdelrahman');

    await page.click('.SubmitButton');
    await page.waitForSelector('.card');
    const text = await page.evaluate(() => {
        return document.querySelector('.heading-tertirary > span').innerText;
    });
    if(text==='THE SEA EXPLORER')
        console.log('e2e test was successful')
    else
        console.log('e2e test failed')
    await browser.close()
}
main()