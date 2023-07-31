import { Keccak } from 'sha3';

const hash = new Keccak(256);

export function Hash2(a, b) {
    hash.reset();
    hash.update(a);
    hash.update(b);
    console.log(hash.digest('hex'));
    return hash.digest('hex');
}

// Hash2('0x3cac317908c699fe873a7f6ee4e8cd63fbe9918b2315c97be91585590168e301','0xd6a4144868703d1474cd7c5b4b1697b412eece270b7a4428b750c7458f73d163')

Hash2('0x9bfb4777f8eaf062b20398bf8af76ec7321e341a2c5efa78388f38c676d162dc','0x1523c6dd799ff293588ba98330d4dae7533b7b8981e37fb687ed901c1bf0530a')
