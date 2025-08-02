import fetch from 'cross-fetch';
import {
	Token,
	ChainName,
	QuoteParams,
	Quote,
	QuoteOptions,
	QuoteError,
	SolanaClientSwap,
	GetSolanaSwapParams, TokenStandard, GetSuiSwapParams, SuiClientSwap
} from './types';
import addresses from './addresses';
import { checkSdkVersionSupport, getSdkVersion } from './utils';
import { SwiftEvmGasLessParams } from './evm/evmSwift';

function toQueryString(params: Record<string, any>): string {
	return Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null && !Array.isArray(value))
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&');
}

async function check5xxError(res: Response): Promise<void> {
	if (res.status.toString().startsWith('5')) {
		let error: Error | QuoteError;
		try {
			const err = await res.json();
			if ((err?.code || err?.statusCode) && (err?.message || err?.msg)) {
				error = {
					code: err?.code || err?.statusCode,
					message: err?.message || err?.msg,
				} as QuoteError
			}
		} catch (err) {
			error = new Error('Internal server error');
		}
		throw error;
	}
}