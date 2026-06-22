import React, { useEffect, useState } from "react";
import { parseCoordinates, reverseGeocode } from "../../../utils/mapUtils";

interface AddressDisplayProps {
  address: string;
  className?: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, className }) => {
  const [displayAddress, setDisplayAddress] = useState(address);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const coords = parseCoordinates(address);
    if (coords) {
      setIsLoading(true);
      reverseGeocode(coords.lat, coords.lng)
        .then((readable) => {
          setDisplayAddress(readable);
        })
        .catch(() => {
          setDisplayAddress(address);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDisplayAddress(address);
    }
  }, [address]);

  if (isLoading) {
    return <span className={className}>Đang tải địa chỉ...</span>;
  }

  return <span className={className} title={displayAddress}>{displayAddress}</span>;
};

export default AddressDisplay;
