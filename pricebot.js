const CoinGecko = require('coingecko-api');

const keys = require('./keys');

const CoinGeckoClient = new CoinGecko();

const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const getPrice = async () => {
    let akita = await CoinGeckoClient.coins.fetch('akita-inu', {});
    let algorand = await CoinGeckoClient.coins.fetch('algorand', {});
    return (akita.data.market_data.current_price.usd / algorand.data.market_data.current_price.usd).toExponential(3);
}

const updatePrice = async () => {
    try {
        client.guilds.cache.forEach(async guild => {
            guild.me.setNickname(`ALGO: ${await getPrice()}`);
        });
    } catch (err) {
        console.error(err);
    }
};

client.on('ready', () => {
    updatePrice();
    setInterval(updatePrice, 1000 * 60);

    client.api.applications(client.user.id).commands.post({
        data: {
            name: 'price',
            description: 'Get up to the second price info on akita',
            options: []
        }
    });

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const commandId = interaction.data.id;
        const commandName = interaction.data.name;
        
        if (commandName == 'price') {
            try {
                const price = await getPrice();
                let content = `The price of akita is ALGO: ${price}`;
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: { content }
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
    });
});

client.login(keys.discord);