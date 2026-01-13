import React from 'react';
import styles from './styles.module.css';

export default function GamePowered() {
  return (
    <section className={styles.gameSection}>
      <div className="container">
        <h2 className={styles.heading}>Why Lua? Because Games.</h2>
        <p className={styles.description}>
          Lua has been an inspiration and foundation for visual, highly dynamic, 
          and naturally interactive systems. From powering <strong>World of Warcraft</strong> 
          mods to running critical AI and game logic in <strong>Angry Birds</strong> and 
          <strong>Corona SDK</strong>, its vibrant heritage makes it ideal for modern web applications.
        </p>
      </div>
    </section>
  );
}

