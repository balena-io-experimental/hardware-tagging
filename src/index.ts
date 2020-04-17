import * as os from "os";
import * as _ from "lodash";
import * as balena from "balena-sdk";

const sdk = balena.fromSharedOptions();
sdk.auth.loginWithToken(process.env.BALENA_API_KEY ?? "");

const BALENA_DEVICE_UUID = process.env.BALENA_DEVICE_UUID ?? "";

const getMacAddresses = () => {
	return _.compact(
		_.map(os.networkInterfaces(), (obj, iface) => {
			if (iface.startsWith('resin-')) {
				return null
			}
			return obj[0].internal ? null : [iface, obj[0].mac];
		})
	);
};

const getCpu = () => {
	return os.cpus()[0].model;
};

const setTag = async (key: string, val: string) => {
	console.log(`setting ${key} to ${val}...`);
	await sdk.models.device.tags.set(BALENA_DEVICE_UUID, key, val);
};

const getHardwareTags = async () => {
	const tags = [
		["CPU", getCpu()],
		["TotalMemMb", `${os.totalmem() / 1024.0 ** 2}`],
		["KernelRelease", os.release()]
	].concat(getMacAddresses());
	_.forEach(tags, async item => {
		await setTag(item[0], item[1]);
	});
};

getHardwareTags();
