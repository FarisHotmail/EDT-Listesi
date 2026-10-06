export interface Company {
  id: string;
  sehir: string;
  ilce: string;
  tabelaUnvani: string;
  musteriUnvani: string;
  adres: string;
  iletisim1: string;
  iletisim2: string;
}

export interface SearchFilters {
  query: string;
  sehir: string;
  ilce: string;
  tabelaUnvani: string;
  musteriUnvani: string;
  adres: string;
}
