import axios from 'axios';
import { Constants } from '../helpers/Constants';
import { AuthService } from './AuthService';

export class ApiService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public callApi(): Promise<any> {
    return this.authService.getUser().then(user => {
      if (user && user.access_token) {
        return this._getApi(user.access_token).catch(error => {
          if (error.response.status === 401) {
            return this.authService.renewToken().then(renewedUser => {
              return this._getApi(renewedUser.access_token);
            });
          }
          throw error;
        });
      } else if (user) {
        return this.authService.renewToken().then(renewedUser => {
          return this._getApi(renewedUser.access_token);
        });
      } else {
        throw new Error('user is not logged in');
      }
    });
  }

  public listWallets(): Promise<any> {
    return this.authService.getUser().then(user => {
      if (user && user.access_token) {
        return this._getApi(user.access_token, 'wallets').catch(error => {
          if (error.response.status === 401) {
            return this.authService.renewToken().then(renewedUser => {
              return this._getApi(renewedUser.access_token, 'wallets');
            });
          }
          throw error;
        });
      } else if (user) {
        return this.authService.renewToken().then(renewedUser => {
          return this._getApi(renewedUser.access_token);
        });
      } else {
        throw new Error('user is not logged in');
      }
    });
  }

  public lnWithdrawal(lnInvoice: string): Promise<any> {
    const data = {
      request: { invoice: lnInvoice }, network: 'lightning'
    }

    return this.authService.getUser().then(user => {
      if (user && user.access_token) {
        return this._postApi(user.access_token, 'withdrawals', data).catch(error => {
          if (error.response.status === 401) {
            return this.authService.renewToken().then(renewedUser => {
              return this._postApi(renewedUser.access_token, 'withdrawals', data);
            });
          }
          throw error;
        });
      } else if (user) {
        return this.authService.renewToken().then(renewedUser => {
          return this._getApi(renewedUser.access_token);
        });
      } else {
        throw new Error('user is not logged in');
      }
    });
  }

  public createWallet(displayName: string, extendedPublicKey: string): Promise<any> {
    const data = {
      displayName, extendedPublicKey
    }

    return this.authService.getUser().then(user => {
      if (user && user.access_token) {
        return this._postApi(user.access_token, 'wallets', data).catch(error => {
          if (error.response.status === 401) {
            return this.authService.renewToken().then(renewedUser => {
              return this._postApi(renewedUser.access_token, 'wallets', data);
            });
          }
          throw error;
        });
      } else if (user) {
        return this.authService.renewToken().then(renewedUser => {
          return this._getApi(renewedUser.access_token);
        });
      } else {
        throw new Error('user is not logged in');
      }
    });
  }

  private _header(token: string): any {
    return {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    };
  }

  private _getApi(token: string, method: string = 'ping'): Promise<any> {
    const headers = this._header(token);

    return axios.get(`${Constants.apiRoot}${method}`, { headers });
  }

  private _postApi(token: string, method: string, body: object): Promise<any> {
    const headers = this._header(token);

    return axios.post(`${Constants.apiRoot}${method}`, body, { headers });
  }
}
