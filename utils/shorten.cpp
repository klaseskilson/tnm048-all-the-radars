#include <iostream>
#include <fstream>

using namespace std;

int main() {
  cout << "opening file...";
  ifstream input("../data/mcsdata4_201303.dsv");
  cout << "done" << endl;

  ofstream ofs;
  ofs.open("../data/new-data.dsv", ofstream::out | ofstream::app);

  cout << "starting...";
  int row = 0,
      numberOfLines = 18689194;
  for (string line; getline(input, line) && row < numberOfLines; ++row) {
    ofs << line << endl;
  }
  cout << "done" << endl;

  return 0;
}
