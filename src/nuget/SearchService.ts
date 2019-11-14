import { NugetApiService } from './nuGetApiService';
import { showInputBox, showPickerView, PickerViewItem } from '../utils/host';

export class SearchService {
  static async search(): Promise<string[] | undefined> {
    const query = await showInputBox('Search the NuGet Gallery for Pacakages', 'Search for Pacakges');

    if (!query) {
      return;
    }

    const results = await NugetApiService.search(query);

    if (!results) {
      return;
    }

    const options = results.data.map(result => {
      return {
        label: result.id,
        description: result.version,
        detail: result.description,
      } as PickerViewItem;
    });

    const selectedOptions = await showPickerView<PickerViewItem>(options, true, 'Select Packages');

    if (!selectedOptions) {
      return [];
    }

    return selectedOptions.map(item => item.label);
  }
}
