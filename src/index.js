const LIBRARIES = {
  Request: require("request"),
  Skill: require("../../../Skill")
};

class Amberdata extends LIBRARIES.Skill {
  constructor(_main, _settings) {
    super(_main, _settings);
    const SELF = this;

    if(this.Settings.APIKey === null) {
      const ERROR = "You have to set the Amberdata API key.";
      this.Main.Log(ERROR);
      throw new Error(ERROR);
    }

    this.Main.Manager.addAction("Amberdata.wallet.get", function(_intent, _socket) {
      const CURRENCIES = {};
      for(let i in _settings.Wallet) {
        if(_settings.Wallet[i] > 0) {
          CURRENCIES[i] = _settings.Wallet[i];
        }
      }

      const AMOUNTS = {};
      for(let i in CURRENCIES) {
        SELF.RequestPricePairsLatest(i, function(_price) {
          AMOUNTS[i] = _price;

          if(Object.keys(CURRENCIES).length === Object.keys(AMOUNTS).length) {
            let amount = 0;

            for(let j in CURRENCIES) {
              amount += CURRENCIES[j] * AMOUNTS[j];
            }

            _intent.Variables.value = Math.floor(amount);
            _intent.answer(_socket);
          }
        });
      }
    });
  }

  /* #################################################################################### */
  /* ### FUNCTIONS ###################################################################### */
  /* #################################################################################### */

  RequestPricePairsLatest(_currency, _callback) {
    const PAIR = _currency.toLowerCase() + "_" + this.Settings.Currency;
    var options = {
      method: "GET",
      url: "https://web3api.io/api/v2/market/prices/" + PAIR + "/latest",
      headers: {
        "x-api-key": this.Settings.APIKey
      }
    };

    LIBRARIES.Request(options, function (error, response, body) {
      if (error){
        throw new Error(error);
      }

      const PRICE = parseFloat(JSON.parse(body).payload[PAIR].price);

      if(_callback !== undefined) {
        _callback(PRICE);
      }
    });
  }
}

module.exports = Amberdata;