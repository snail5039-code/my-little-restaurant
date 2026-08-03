export {};

declare global {
  interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
  }

  type KakaoMapInstance = object;

  type KakaoMarker = object;

  interface KakaoInfoWindow {
    open(map: KakaoMapInstance, marker: KakaoMarker): void;
  }

  interface KakaoGeocoderResult {
    x: string;
    y: string;
  }

  interface KakaoGeocoder {
    addressSearch(
      address: string,
      callback: (result: KakaoGeocoderResult[], status: string) => void
    ): void;
  }

  interface KakaoMapsSDK {
    load(callback: () => void): void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number }
    ) => KakaoMapInstance;
    Marker: new (options: {
      position: KakaoLatLng;
      map?: KakaoMapInstance;
    }) => KakaoMarker;
    InfoWindow: new (options: { content: string }) => KakaoInfoWindow;
    event: {
      addListener(
        target: KakaoMarker,
        type: string,
        handler: () => void
      ): void;
    };
    services: {
      Geocoder: new () => KakaoGeocoder;
      Status: { OK: string };
    };
  }

  interface Window {
    kakao?: {
      maps: KakaoMapsSDK;
    };
  }
}
