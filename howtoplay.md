A rectangular board is generated, with mines spread out on it randomly. You how much mines there are, but don't know *where* they are.

Open random cells on the board with left-click, until one click opens a chunk of the board.

Opening a cell without a mine will show you a number, denoting how much of the eight cells around this cell contain a mine. Empty = 0, and it opens all cells around it (often triggering a chain reaction).

Right click a cell to  "flag" it, to mark it as a mine, that way you won't accidentally open that cell, if you click it. Right-click a flagged mine to unflag it.

Using logical deduction, open every safe cell without opening a cell with a mine.



e.g., If a cell with a 1 has only one unopen cell near it, that cell has to be a mine - you can flag it.

If a cell with a 2 already has two (correct!) flags around it, all unflagged cells near it are safe - you can either left-click or right-click the cell to "chord" it, opening all of them.

(Watch out, though, as you may open a mine this way.)



You can read about some strategies and patterns on https://minesweeper.online/help/patterns.